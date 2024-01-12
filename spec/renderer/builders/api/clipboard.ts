import { vi } from 'vitest'

let text = ''

export default {
  clipboard: {
    paste: vi.fn(),
    readtext: vi.fn(() => text),
    writetext: vi.fn((value) => { text = value })
  }
}
