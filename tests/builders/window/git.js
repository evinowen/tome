const repository = (path) => ({
  path,
  remotes: [{
    name: 'origin',
    url: 'git@git.example.com:remote.git'
  }]
})

export default {
  load_repository: jest.fn(async (path) => repository(path)),
  clear_remote_repository: jest.fn(),
  inspect_repository: jest.fn(),
  refresh_repository: jest.fn(() => ({ available: {}, staged: {} })),
  refresh_patches_repository: jest.fn(() => ({ patches: {} })),
  credential_repository: jest.fn((private_key, public_key, passphrase) => null),
  load_remote_url_repository: jest.fn((url) => null),
  remote_repository: jest.fn(() => ({ remote: {}, pending: {} })),
  stage_repository: jest.fn(),
  reset_repository: jest.fn(),
  diff_path_repository: jest.fn(),
  diff_commit_repository: jest.fn(),
  commit_repository: jest.fn((name, email, message) => null),
  push_repository: jest.fn(() => null)
}
