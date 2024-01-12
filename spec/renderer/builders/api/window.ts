import { vi } from 'vitest'

let maximized = false

export default {
  window: {
    is_maximized: vi.fn(async () => maximized),
    restore: vi.fn(async () => { maximized = false }),
    maximize: vi.fn(async () => { maximized = true }),
    minimize: vi.fn(async () => { maximized = false }),
    close: vi.fn(async () => false)
  }
}
