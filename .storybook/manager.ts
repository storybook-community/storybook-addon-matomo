import { addons } from 'storybook/manager-api'

addons.setConfig({
  matomo: {
    baseUrl: 'insert_base_url_here',
    siteId: 1234,
    heartbeat: true,
  },
})

// addons.setConfig({
//   matomo: {
//     baseUrl: process.env.STORYBOOK_MATOMO_URL,
//     siteId: process.env.STORYBOOK_MATOMO_SITE_ID,
//   },
// })
