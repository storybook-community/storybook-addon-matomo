import { addons } from 'storybook/manager-api'
import Events from 'storybook/internal/core-events'
import { logger } from 'storybook/internal/client-logger'

import { ADDON_ID, KEY } from './constants'

// Set up event queue.
type MatomoEventQueue = (string | undefined)[][]
declare global {
  interface Window {
    _paq: MatomoEventQueue
  }
}
window._paq = window._paq || []

function trackPageView(story: string) {
  logger.debug('Tracking page view in Matomo.')
  window._paq.push(['setCustomUrl', '/' + window.location.hash.substring(1)])
  window._paq.push([
    'setDocumentTitle',
    story ? `Storybook - ${story}` : document.title,
  ])
  window._paq.push(['trackPageView'])
}
function trackEvent(event: {
  category: string
  action: string
  name?: string
}) {
  logger.debug('Tracking event in Matomo.')
  window._paq.push(['setDocumentTitle', document.title])
  window._paq.push(['trackEvent', event.category, event.action, event.name])
}

addons.register(ADDON_ID, (api) => {
  logger.debug('Registering Matomo addon.')

  const config = addons.getConfig()
  if (!config[KEY]) {
    logger.warn(
      `Matomo addon is not configured. Pass options through addons.setConfig() in your manager file to enable analytics.`,
    )
    return
  }

  if (!config[KEY].baseUrl) {
    logger.error(
      `matomo.baseUrl must be set to the URL where your Matomo instance is running. Disabling analytics.`,
    )
    return
  }
  if (!config[KEY].siteId) {
    logger.error(
      `matomo.siteId must be set to the ID of your Matomo site. Disabling analytics.`,
    )
    return
  }

  // Tracker initialisation requires these specific events, and downloading the script.
  window._paq.push(['trackPageView'])
  window._paq.push(['enableLinkTracking'])
  const url = config[KEY].baseUrl.endsWith('/')
    ? config[KEY].baseUrl
    : config[KEY].baseUrl + '/'
  logger.debug(`Matomo baseUrl: ${url}; siteId: ${config[KEY].siteId}`)
  window._paq.push(['setTrackerUrl', `${url}matomo.php`])
  window._paq.push(['setSiteId', `${config[KEY].siteId}`])
  const g = document.createElement('script')
  const s = document.getElementsByTagName('script')[0]
  g.type = 'text/javascript'
  g.async = true
  g.src = `${url}matomo.js`
  if (!s || !s.parentNode) {
    logger.error('Failed to find where to inject Matomo script element.')
    return
  }
  s.parentNode.insertBefore(g, s)

  // Handle options.
  if (config[KEY].heartbeat) {
    logger.debug('Enabling Matomo heartbeat.')
    window._paq.push(['enableHeartBeatTimer'])
  }

  api.on(Events.STORY_CHANGED, (story: string) => {
    trackPageView(story)
  })

  api.on(Events.STORY_ERRORED, ({ title, description }) => {
    trackEvent({
      category: 'error',
      action: 'story-errored',
      name: `"${title}" story encountered error: ${description}`,
    })
  })

  api.on(Events.STORY_THREW_EXCEPTION, (err) => {
    trackEvent({
      category: 'error',
      action: 'story-threw-exception',
      name: err,
    })
  })

  api.on(Events.STORY_MISSING, (id) => {
    trackEvent({
      category: 'error',
      action: 'story-missing',
      name: `attempted to render ${id}, but it is missing`,
    })
  })
})
