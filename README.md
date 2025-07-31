<h1 id="main">Storybook Addon Matomo</h1>

> [!NOTE]
> This is a fork maintained by the community to provide support for Storybook 9 and beyond. This addon was originally developed by Alex Nicholls.

------

Storybook Addon Matomo can be used to support [Matomo Analytics](https://matomo.org/) in [Storybook](https://storybook.js.org).

## Getting Started

Install:

```sh
yarn add -D storybook-addon-matomo
```

```sh
npm install -D storybook-addon-matomo
```

```sh
pnpm install -D storybook-addon-matomo
```

In your `.storybook/main.ts` file, add the following:

```ts
// .storybook/main.ts
export default {
  addons: ['storybook-addon-matomo'],
}
```

In your `.storybook/manager.ts` file, add the following config, and adjust values to match your Matomo settings:

```ts
// .storybook/manager.ts
import { addons } from 'storybook/manager-api'

addons.setConfig({
  matomo: {
    baseUrl: 'https://matomo.francetelevisions.tv/',
    siteId: 18,
  },
})
```

If you would like to store your `baseUrl` or `siteId`, etc. in an [environment variable](https://storybook.js.org/docs/react/configure/environment-variables) so it is not available in your repo, add an `.env` file to the root of your project or set environment variables in your CI:

```
STORYBOOK_MATOMO_URL = https://LINK.TO.DOMAIN
STORYBOOK_MATOMO_SITE_ID = 3
```

And reference those variables in `.storybook/manager.ts`:

```ts
// .storybook/manager.ts
import { addons } from 'storybook/manager-api'

addons.setConfig({
  matomo: {
    baseUrl: process.env.STORYBOOK_MATOMO_URL,
    siteId: process.env.STORYBOOK_MATOMO_SITE_ID,
  },
})
```

## Options

To enable Matomo's heartbeat timer that more accurately tracks time spent on a page, pass `heartbeat: true` to the config:

```ts
// .storybook/manager.ts
addons.setConfig({
  matomo: {
    // ...
    heartbeat: true,
  },
})
```

## Contributing

### Code of Conduct

Please read the [Code of Conduct](https://github.com/storybook-community/storybook-addon-matomo/blob/main/CODE_OF_CONDUCT.md) first.

### Developer Certificate of Origin

To ensure that contributors are legally allowed to share the content they contribute under the license terms of this project, contributors must adhere to the [Developer Certificate of Origin](https://developercertificate.org/) (DCO). All contributions made must be signed to satisfy the DCO. This is handled by a Pull Request check.

> By signing your commits, you attest to the following:
>
> 1. The contribution was created in whole or in part by you and you have the right to submit it under the open source license indicated in the file; or
> 2. The contribution is based upon previous work that, to the best of your knowledge, is covered under an appropriate open source license and you have the right under that license to submit that work with modifications, whether created in whole or in part by you, under the same open source license (unless you are permitted to submit under a different license), as indicated in the file; or
> 3. The contribution was provided directly to you by some other person who certified 1., 2. or 3. and you have not modified it.
> 4. You understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information you submit with it, including your sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

### Getting Started

This project uses PNPM as a package manager.

- See the [installation instructions for PNPM](https://pnpm.io/installation)
- Run `pnpm i`

### Useful commands

- `pnpm start` starts the local Storybook
- `pnpm build` builds and packages the addon code
- `pnpm pack:local` makes a local tarball to be used as a NPM dependency elsewhere
- `pnpm test` runs unit tests

### Migrating to a later Storybook version

If you want to migrate the addon to support the latest version of Storyboook, you can check out the [addon migration guide](https://storybook.js.org/docs/addons/addon-migration-guide).

### Release System

This package auto-releases on pushes to `main` with [semantic-release](https://github.com/semantic-release/semantic-release). No changelog is maintained and the version number in `package.json` is not synchronised.

## Support

Please [open an issue](https://github.com/storybook-community/storybook-addon-matomo/issues/new) for bug reports or code suggestions. Make sure to include a working Minimal Working Example for bug reports. You may use [storybook.new](https://new-storybook.netlify.app/) to bootstrap a reproduction environment.
