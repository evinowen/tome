import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/repository/credentials', () => ({
  fetch_repository_credentials_store: vi.fn(() => ({
    load: vi.fn(),
  })),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/remotes', () => {
  let repository_remotes

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_remotes = fetch_repository_remotes_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.remote_list upon load action dispatch', async () => {
    await repository_remotes.load()

    expect(mocked_api.repository.remote_list).toHaveBeenCalledTimes(1)
  })

  it('should populate list from api.repository.remote_list return upon load action dispatch', async () => {
    const list = [
      { name: 'origin', url: 'git@127.0.0.1:username/example.git' },
    ]

    mocked_api.repository.remote_list.mockReturnValueOnce(list)
    await repository_remotes.load()

    expect(repository_remotes.list).toEqual(list)
  })

  it('should call api.repository.remote_add upon add action dispatch', async () => {
    const name = 'origin'
    const url = 'git@127.0.0.1:username/example.git'

    await repository_remotes.add({ name, url })

    expect(mocked_api.repository.remote_add).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.remote_add).toHaveBeenCalledWith(name, url)
  })

  it('should call api.repository.remote_remove upon remove action dispatch', async () => {
    const name = 'origin'

    await repository_remotes.remove({ name })

    expect(mocked_api.repository.remote_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.remote_remove).toHaveBeenCalledWith(name)
  })
})
