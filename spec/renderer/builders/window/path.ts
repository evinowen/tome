const separator = '/'

export default {
  path: {
    dirname: jest.fn(async (path) => String(path).slice(0, Math.max(0, String(path).lastIndexOf('/')))),
    basename: jest.fn(async (path) => String(path).slice(Math.max(0, String(path).lastIndexOf('/') + 1))),
    extension: jest.fn(async (path) => String(path).slice(Math.max(0, String(path).lastIndexOf('.')))),
    relative: jest.fn(async (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).slice(Math.max(0, String(first).length + 1)) : ''),
    join: jest.fn(async (...items) => items.join(separator)),
    sep: jest.fn(() => separator)
  }
}
