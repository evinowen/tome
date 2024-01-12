import { vi } from 'vitest'

export default {
  app: {
    getPath: vi.fn(async (path) => `/home/${path}`),
    getVersion: vi.fn(async () => '0.0.0'),
    getProcess: vi.fn(async () => ({
      versions: {
        chrome: '0.0.0',
        electron: '0.0.0',
        node: '0.0.0',
        v8: '0.0.0'
      },
      sandboxed: false
    }))
  }
}
