import { vi } from 'vitest'

export default {
  log: {
    info: vi.fn(() => undefined),
    error: vi.fn(() => undefined),
  }
}
