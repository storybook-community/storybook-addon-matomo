import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addons, type API } from 'storybook/manager-api'
import Events from 'storybook/internal/core-events'
import { logger } from 'storybook/internal/client-logger'

// Registers the addon in Storybook's addon store; each test runs it with addons.loadAddons().
import './manager'

// Nothing listens on the discard port, so the injected matomo.js never loads.
const BASE_URL = 'http://127.0.0.1:9/matomo'
const PAGE_TITLE = 'Example / Button - Secondary ⋅ Storybook'

type ManagerApi = Pick<API, 'on' | 'getUrlState' | 'getCurrentStoryData'>
type UrlState = ReturnType<API['getUrlState']>
type Entry = ReturnType<API['getCurrentStoryData']>

const secondaryStory = {
  type: 'story',
  subtype: 'story',
  id: 'example-button--secondary',
  name: 'Secondary',
  title: 'Example/Button',
  importPath: './src/stories/Button.stories.ts',
  exportName: 'Secondary',
  parent: 'example-button',
  depth: 2,
  tags: ['dev', 'test', 'manifest'],
  prepared: true,
} satisfies Entry

const workingPageDocs = {
  type: 'docs',
  id: 'example-workingpage--docs',
  name: 'WorkingPage',
  title: 'Example/WorkingPage',
  importPath: './src/stories/WorkingPage.mdx',
  parent: 'example-workingpage',
  depth: 2,
  tags: ['dev', 'test', 'manifest', 'unattached-mdx'],
  prepared: true,
} satisfies Entry

function urlState(path: string): UrlState {
  const [, viewMode, storyId] = path.split('/')
  return {
    path,
    hash: '',
    queryParams: {},
    storyId,
    url: `/?path=${path}`,
    viewMode,
  }
}

/** Runs the registered addon against a stand-in for the manager API. */
function loadAddon(config: Record<string, unknown> | undefined) {
  const handlers = new Map<string, (...args: unknown[]) => void>()
  let state = {
    url: urlState('/story/example-button--primary'),
    entry: undefined as Entry | undefined,
  }
  const api: ManagerApi = {
    on: (event, handler) => {
      handlers.set(event, handler)
      return () => handlers.delete(event)
    },
    getUrlState: () => state.url,
    getCurrentStoryData: () => state.entry as Entry,
  }

  addons.setConfig({ matomo: config })
  addons.loadAddons(api as API)

  return {
    /** Moves the manager to a new URL and current entry, as Storybook does before the event fires. */
    navigate(path: string, entry: Entry | undefined) {
      state = { url: urlState(path), entry }
    },
    emit(event: string, ...args: unknown[]) {
      handlers.get(event)?.(...args)
    },
  }
}

function injectedScripts() {
  return [...document.querySelectorAll<HTMLScriptElement>('script')].filter(
    (script) => script.src.startsWith(BASE_URL),
  )
}

/** Returns what the addon pushed to the Matomo queue while running `fn`. */
function pushedDuring(fn: () => void) {
  const start = window._paq.length
  fn()
  return window._paq.slice(start)
}

const originalTitle = document.title

beforeEach(() => {
  window._paq = []
  document.title = PAGE_TITLE
})

afterEach(() => {
  injectedScripts().forEach((script) => script.remove())
  document.title = originalTitle
  vi.restoreAllMocks()
})

describe('configuration', () => {
  it.each([
    {
      problem: 'no matomo config',
      config: undefined,
      level: 'warn',
      message: 'not configured',
    },
    {
      problem: 'no baseUrl',
      config: { siteId: '42' },
      level: 'error',
      message: 'matomo.baseUrl',
    },
    {
      problem: 'no siteId',
      config: { baseUrl: BASE_URL },
      level: 'error',
      message: 'matomo.siteId',
    },
  ] as const)(
    'disables tracking and logs why when there is $problem',
    ({ config, level, message }) => {
      const log = vi.spyOn(logger, level).mockImplementation(() => {})

      const addon = loadAddon(config)
      addon.navigate('/story/example-button--secondary', secondaryStory)
      addon.emit(Events.STORY_CHANGED, 'example-button--secondary')

      expect(window._paq).toEqual([])
      expect(injectedScripts()).toEqual([])
      expect(log).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining(message),
      )
    },
  )
})

describe('tracker initialisation', () => {
  it.each([BASE_URL, `${BASE_URL}/`])(
    'tracks the landing page and loads the tracker from baseUrl %s',
    (baseUrl) => {
      loadAddon({ baseUrl, siteId: '42' })

      expect(window._paq).toEqual([
        ['trackPageView'],
        ['enableLinkTracking'],
        ['setTrackerUrl', 'http://127.0.0.1:9/matomo/matomo.php'],
        ['setSiteId', '42'],
      ])
      expect(injectedScripts()).toHaveLength(1)
      expect(injectedScripts()[0].src).toBe(
        'http://127.0.0.1:9/matomo/matomo.js',
      )
      expect(injectedScripts()[0].async).toBe(true)
    },
  )

  it('enables the heartbeat timer when heartbeat is set', () => {
    loadAddon({ baseUrl: BASE_URL, siteId: '42', heartbeat: true })

    expect(window._paq).toContainEqual(['enableHeartBeatTimer'])
  })
})

describe('page views', () => {
  it.each([
    {
      page: 'a story',
      path: '/story/example-button--secondary',
      entry: secondaryStory,
      storyId: 'example-button--secondary',
      title: 'Storybook - Example/Button - Secondary',
    },
    {
      page: 'a docs page',
      path: '/docs/example-workingpage--docs',
      entry: workingPageDocs,
      storyId: 'example-workingpage--docs',
      title: 'Storybook - Example/WorkingPage - WorkingPage',
    },
    {
      page: 'an entry missing from the index',
      path: '/story/example-button--secondary',
      entry: undefined,
      storyId: 'example-button--secondary',
      title: 'Storybook - example-button--secondary',
    },
    {
      page: 'an unknown entry without an id',
      path: '/story/example-button--secondary',
      entry: undefined,
      storyId: '',
      title: PAGE_TITLE,
    },
  ])(
    'tracks the Storybook path when switching to $page',
    ({ path, entry, storyId, title }) => {
      const addon = loadAddon({ baseUrl: BASE_URL, siteId: '42' })
      addon.navigate(path, entry)

      expect(
        pushedDuring(() => addon.emit(Events.STORY_CHANGED, storyId)),
      ).toEqual([
        ['setCustomUrl', path],
        ['setDocumentTitle', title],
        ['trackPageView'],
      ])
    },
  )
})

describe('error events', () => {
  it.each([
    {
      event: Events.STORY_ERRORED,
      payload: {
        title: 'Button',
        description: 'Expecting a valid React element',
      },
      action: 'story-errored',
      name: '"Button" story encountered error: Expecting a valid React element',
    },
    {
      event: Events.STORY_THREW_EXCEPTION,
      payload: {
        name: 'TypeError',
        message: "Cannot read properties of undefined (reading 'label')",
        stack:
          "TypeError: Cannot read properties of undefined (reading 'label')\n" +
          '    at Button (http://localhost:6006/src/stories/Button.tsx:31:24)',
      },
      action: 'story-threw-exception',
      name: "TypeError: Cannot read properties of undefined (reading 'label')",
    },
    {
      event: Events.STORY_MISSING,
      payload: 'example-button--removed',
      action: 'story-missing',
      name: 'attempted to render example-button--removed, but it is missing',
    },
  ])('tracks $event as an error event', ({ event, payload, action, name }) => {
    const addon = loadAddon({ baseUrl: BASE_URL, siteId: '42' })

    expect(pushedDuring(() => addon.emit(event, payload))).toEqual([
      ['setDocumentTitle', PAGE_TITLE],
      ['trackEvent', 'error', action, name],
    ])
  })
})
