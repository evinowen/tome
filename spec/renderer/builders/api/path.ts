import { vi } from 'vitest'

const separator = '/'

export default {
  path: {
    dirname: vi.fn(async (path) => String(path).slice(0, Math.max(0, String(path).lastIndexOf('/')))),
    basename: vi.fn(async (path) => String(path).slice(Math.max(0, String(path).lastIndexOf('/') + 1))),
    extension: vi.fn(async (path) => String(path).slice(Math.max(0, String(path).lastIndexOf('.')))),
    relative: vi.fn(async (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).slice(Math.max(0, String(first).length + 1)) : ''),
    join: vi.fn(async (...items) => items.join(separator)),
    sep: vi.fn(() => separator)
  }
}
