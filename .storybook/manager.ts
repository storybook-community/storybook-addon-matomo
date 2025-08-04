import { addons } from 'storybook/manager-api'

addons.setConfig({
  matomo: {
    baseUrl: process.env.STORYBOOK_MATOMO_URL,
    siteId: process.env.STORYBOOK_MATOMO_SITE_ID,
  },
})
