import { createRequire } from 'node:module'

function managerEntries(entry = []) {
  const require = createRequire(import.meta.url)
  return [...entry, require.resolve('../dist/manager.js')]
}

export default {
  managerEntries,
}
