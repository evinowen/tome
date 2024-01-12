import { vi } from 'vitest'

const repository = (path) => ({
  path,
  history: [],
  remotes: [{
    name: 'origin',
    url: 'git@git.example.com:remote.git'
  }]
})

export default {
  repository: {
    load: vi.fn(async (path) => repository(path)),
    clear_remote: vi.fn(),
    inspect: vi.fn(),
    refresh: vi.fn(() => ({ available: {}, staged: {} })),
    refresh_patches: vi.fn(() => ({ patches: {} })),
    credential: vi.fn(),
    load_remote_url: vi.fn(),
    remote: vi.fn(() => ({ remote: {}, pending: {} })),
    stage: vi.fn(),
    reset: vi.fn(),
    diff_path: vi.fn(),
    diff_commit: vi.fn(),
    commit: vi.fn(),
    push: vi.fn()
  }
}
