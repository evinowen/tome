import { vi } from 'vitest'

export default {
  action: {
    invoke: vi.fn(() => ({ success: true }))
  }
}
