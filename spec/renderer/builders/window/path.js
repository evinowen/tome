const sep = '/'

export default {
  path: {
    dirname: jest.fn(async (path) => String(path).substring(0, String(path).lastIndexOf('/'))),
    basename: jest.fn(async (path) => String(path).substring(String(path).lastIndexOf('/') + 1)),
    extension: jest.fn(async (path) => String(path).substring(String(path).lastIndexOf('.'))),
    relative: jest.fn(async (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).substring(String(first).length + 1) : ''),
    join: jest.fn(async (first, second, third) => String(first).concat(sep).concat(second).concat(third ? String(sep).concat(third) : '')),
    sep: jest.fn(() => sep)
  }
}
