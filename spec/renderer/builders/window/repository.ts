const repository = (path) => ({
  path,
  remotes: [{
    name: 'origin',
    url: 'git@git.example.com:remote.git'
  }]
})

export default {
  repository: {
    load: jest.fn(async (path) => repository(path)),
    clear_remote: jest.fn(),
    inspect: jest.fn(),
    refresh: jest.fn(() => ({ available: {}, staged: {} })),
    refresh_patches: jest.fn(() => ({ patches: {} })),
    credential: jest.fn(),
    load_remote_url: jest.fn(),
    remote: jest.fn(() => ({ remote: {}, pending: {} })),
    stage: jest.fn(),
    reset: jest.fn(),
    diff_path: jest.fn(),
    diff_commit: jest.fn(),
    commit: jest.fn(),
    push: jest.fn()
  }
}
