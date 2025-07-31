/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

export default defineConfig({
  plugins: [react(), storybookTest({ storybookScript: 'pnpm storybook --ci' })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    coverage: {
      include: [
        'src/**/*.{mjs,mjsx,js,jsx,ts,tsx}',
        '!src/stories/**',
        '!src/examples/**',
        '!src/**/*.stories.{ts,tsx}',
      ],
      provider: 'istanbul',
    },
    setupFiles: ['./.storybook/vitest.setup.ts'],
  },
})
