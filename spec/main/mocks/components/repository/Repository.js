const { random_string } = require('?/helpers')(expect)

const mock = jest.fn().mockImplementation((path) => ({
  name: path,
  path,
  history: [],
  branch: undefined,
  ahead: false,
  remotes: [],
  remote: undefined,
  pending:  [],
  available: [],
  staged: [],
  patches: [],
  load: jest.fn(),
  inspect: jest.fn(),
  diffPath: jest.fn(),
  diffCommit: jest.fn(),
  storeCredentials: jest.fn(),
  stage: jest.fn((query, listener) => {
    listener('add', query)
    listener('remove', query)
    listener('test', query)
  }),
  stagePath: jest.fn(),
  reset: jest.fn((query, listener) => {
    listener('add', query)
    listener('remove', query)
    listener('test', query)
  }),
  resetPath: jest.fn(),
  commit: jest.fn(() => ({ tostrS: () => random_string(16) })),
  push: jest.fn(),
  clearRemoteBranch: jest.fn(),
  loadRemoteBranch: jest.fn(),
}))

module.exports = mock
