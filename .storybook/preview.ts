import { definePreview } from '@storybook/react-vite'
import addonDocs from '@storybook/addon-docs'

// to load the addon from source in this test Storybook
import addonMatomo from '../src/index'

export default definePreview({ addons: [addonDocs(), addonMatomo()] })
