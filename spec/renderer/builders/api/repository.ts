import { vi } from 'vitest'

const remotes = [ {
  name: 'origin',
  url: 'git@git.example.com:remote.git',
} ]

const repository = (path) => ({
  path,
  history: [],
  remotes,
})

let available
let staged

export const reset_inspect = () => {
  available = [
    { path: '/test.file.1.md', type: 'new' },
    { path: '/test.file.2.md', type: 'new' },
    { path: '/test.file.3.md', type: 'modified' },
  ]

  staged = []
}

reset_inspect()

const reset = (path) => {
  const index = staged.findIndex((value) => value.path = path)
  available.push(staged[index])
  staged.splice(index, 1)
}

const stage = (path) => {
  const index = available.findIndex((value) => value.path = path)
  staged.push(available[index])
  available.splice(index, 1)
}

export default {
  repository: {
    commit: vi.fn(),
    credential_password: vi.fn(),
    credential_key: vi.fn(),
    diff_commit: vi.fn(() => ({ patches: [] })),
    diff_path: vi.fn(() => ({ patches: [] })),
    inspect: vi.fn(() => ({ available, staged })),
    load: vi.fn(async (path) => repository(path)),
    push: vi.fn(),
    refresh_patches: vi.fn(() => ({ patches: [] })),
    branch_status: vi.fn(() => ({ list: [], active: '' })),
    branch_create: vi.fn(),
    branch_select: vi.fn(),
    branch_rename: vi.fn(),
    branch_remove: vi.fn(() => remotes),
    remote_add: vi.fn(),
    remote_clear: vi.fn(),
    remote_list: vi.fn(() => remotes),
    remote_load: vi.fn(),
    remote_remove: vi.fn(),
    remote_status: vi.fn(() => ({ remote: {}, pending: {} })),
    reset: vi.fn(reset),
    stage: vi.fn(stage),
    history_list: vi.fn(() => []),
  },
}
