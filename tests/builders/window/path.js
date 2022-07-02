const sep = '/'

export default {
  path_dirname: jest.fn(async (path) => String(path).substring(0, String(path).lastIndexOf('/'))),
  path_basename: jest.fn(async (path) => String(path).substring(String(path).lastIndexOf('/') + 1)),
  path_relative: jest.fn(async (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).substring(String(first).length + 1) : ''),
  path_join: jest.fn(async (first, second, third) => String(first).concat(sep).concat(second).concat(third ? String(sep).concat(third) : '')),
  path_sep: jest.fn(() => sep)
}
