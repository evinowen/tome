import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_store } from '@/store/modules/repository'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/actions', () => ({
  fetch_actions_store: vi.fn(() => ({ load: vi.fn() })),
}))

vi.mock('@/store/modules/configuration', () => ({
  fetch_configuration_store: vi.fn(() => ({
    load: vi.fn(),
    load_local: vi.fn(),
    reset_local: vi.fn(),
  })),
}))

vi.mock('@/store/modules/templates', () => ({
  fetch_templates_store: vi.fn(() => ({ load: vi.fn() })),
}))

vi.mock('@/store/modules/repository/branches', () => ({
  fetch_repository_branches_store: vi.fn(() => ({ load: vi.fn() })),
}))

vi.mock('@/store/modules/repository/tags', () => ({
  fetch_repository_tags_store: vi.fn(() => ({ load: vi.fn() })),
}))

vi.mock('@/store/modules/repository/remotes', () => ({
  fetch_repository_remotes_store: vi.fn(() => ({
    load: vi.fn(),
    select: vi.fn(),
  })),
}))

vi.mock('@/store/modules/repository/credentials', () => ({
  fetch_repository_credentials_store: vi.fn(() => ({ load: vi.fn() })),
}))

vi.mock('@/store/modules/repository/committer', () => ({
  fetch_repository_committer_store: vi.fn(() => ({ inspect: vi.fn() })),
}))

vi.mock('@/store/modules/repository/committer/signature', () => ({
  fetch_repository_committer_signature_store: vi.fn(() => ({
    sign_name: vi.fn(),
    sign_email: vi.fn(),
    sign_message: vi.fn(),
  })),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository', () => {
  let repository

  beforeEach(() => {
    setActivePinia(createPinia())
    repository = fetch_repository_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load and initalize the repository on dispatch of load action', async () => {
    await repository.load('/path/to/repository')

    expect(repository).toBeDefined()
    expect(repository).not.toBeUndefined()
  })

  it('should reset the repository state on dispatch of clear action', async () => {
    await repository.load('/path/to/repository')

    await repository.clear()

    expect(repository).toBeDefined()
    expect(repository.repository).toBeUndefined()
  })
})
