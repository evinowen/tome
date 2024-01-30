import { vi } from 'vitest'

export default {
  template: {
    invoke: vi.fn(() => ({ success: true })),
  },
}
