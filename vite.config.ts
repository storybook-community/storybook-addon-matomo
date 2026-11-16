import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: ['src/**/*.{mjs,mjsx,js,jsx,ts,tsx}'],
      exclude: [
        'src/stories/**',
        'src/examples/**',
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.test.{ts,tsx}',
      ],
      provider: 'istanbul',
    },
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ storybookScript: 'pnpm storybook --ci' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
            // Unit tests render nothing, so failure screenshots would be blank.
            screenshotFailures: false,
          },
        },
      },
    ],
  },
})
