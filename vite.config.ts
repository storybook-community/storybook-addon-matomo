import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

export default defineConfig({
  plugins: [react(), storybookTest({ storybookScript: 'pnpm storybook --ci' })],
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
    coverage: {
      include: ['src/**/*.{mjs,mjsx,js,jsx,ts,tsx}'],
      exclude: [
        'src/stories/**',
        'src/examples/**',
        'src/**/*.stories.{ts,tsx}',
      ],
      provider: 'istanbul',
    },
  },
})
