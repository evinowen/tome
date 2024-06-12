import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_remotes_store, StateDefaults } from '@/store/modules/repository/remotes'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'

/* @/api */
import * as api_module from '@/api'
const api = {
  repository: {
    remote_clear: vi.fn(),
    remote_list: vi.fn(),
    remote_add: vi.fn(),
    remote_remove: vi.fn(),
    remote_load: vi.fn(),
    remote_status: vi.fn(),
    push: vi.fn(),
  },
}
Object.assign(api_module, { default: api })

/* @/store/modules/log */
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

/* @/store/modules/repository/credentials */
vi.mock('@/store/modules/repository/credentials', () => ({
  fetch_repository_credentials_store: vi.fn(() => ({
    load: vi.fn(),
  })),
}))

describe('store/modules/repository/remotes', () => {
  let repository_remotes
  let repository_credentials

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_remotes = fetch_repository_remotes_store()
    repository_remotes.$reset()

    repository_credentials = {
      load: vi.fn(),
    }

    vi.mocked(fetch_repository_credentials_store).mockReturnValue(repository_credentials)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.remote_list upon call to load', async () => {
    await repository_remotes.load()

    expect(api.repository.remote_list).toHaveBeenCalledTimes(1)
  })

  it('should populate list from api.repository.remote_list return upon call to load', async () => {
    const list = [
      { name: 'origin', url: 'git@127.0.0.1:username/example.git' },
    ]

    api.repository.remote_list.mockReturnValueOnce(list)
    await repository_remotes.load()

    expect(repository_remotes.list).toEqual(list)
  })

  it('should reset selected and active upon call to clear', async () => {
    repository_remotes.selected = 'origin'
    repository_remotes.active = {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    await repository_remotes.clear()

    expect(repository_remotes.selected).toEqual('')
    expect(repository_remotes.active).toEqual(StateDefaults().active)
  })

  it('should call api.repository.remote_clear upon call to select', async () => {
    const name = 'origin'

    await repository_remotes.select(name)

    expect(api.repository.remote_clear).toHaveBeenCalledTimes(1)
  })

  it('should set selected to provied name upon call to select', async () => {
    const name = 'origin'

    await repository_remotes.select(name)

    expect(repository_remotes.selected).toEqual(name)
  })

  it('should call api.repository.remote_load upon call to select', async () => {
    const name = 'origin'

    await repository_remotes.select(name)

    expect(api.repository.remote_load).toHaveBeenCalledWith(name)
  })

  it('should set error when api.repository.remote_load returns error upon call to select', async () => {
    const error = 'error-message'
    api.repository.remote_load.mockImplementation(() => ({ error }))

    const name = 'origin'

    await repository_remotes.select(name)

    expect(repository_remotes.error).toEqual(error)
  })

  it('should not call api.repository.remote_status when api.repository.remote_load returns error upon call to select', async () => {
    const error = 'error-message'
    api.repository.remote_load.mockImplementation(() => ({ error }))

    const name = 'origin'

    await repository_remotes.select(name)

    expect(api.repository.remote_status).not.toHaveBeenCalledWith()
  })

  it('should call api.repository.remote_status when api.repository.remote_load succeeds upon call to select', async () => {
    api.repository.remote_load.mockImplementation(() => ({}))

    const name = 'origin'

    await repository_remotes.select(name)

    expect(api.repository.remote_status).toHaveBeenCalledWith()
  })

  it('should call api.repository.remote_status upon call to status', async () => {
    api.repository.remote_status.mockImplementation(() => ({}))

    await repository_remotes.status()

    expect(api.repository.remote_status).toHaveBeenCalledWith()
  })

  it('should set error when api.repository.remote_status returns error upon call to status', async () => {
    const error = 'error-message'
    api.repository.remote_status.mockImplementation(() => ({ error }))

    await repository_remotes.status()

    expect(repository_remotes.error).toEqual(error)
  })

  it('should set active when api.repository.remote_status succeeds upon call to status', async () => {
    const active = {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    api.repository.remote_status.mockImplementation(() => active)

    await repository_remotes.status()

    expect(repository_remotes.error).toEqual('')
    expect(repository_remotes.active).toEqual(active)
  })

  it('should call repository_remotes.select when repository_remotes.selected upon call to reselect', async () => {
    const name = 'origin'

    repository_remotes.selected = name

    repository_remotes.select = vi.fn()
    await repository_remotes.reselect()

    expect(repository_remotes.select).toHaveBeenCalledWith(name)
  })

  it('should call api.repository.remote_add upon call to add', async () => {
    const name = 'origin'
    const url = 'git@127.0.0.1:username/example.git'

    await repository_remotes.add({ name, url })

    expect(api.repository.remote_add).toHaveBeenCalledTimes(1)
    expect(api.repository.remote_add).toHaveBeenCalledWith(name, url)
  })

  it('should call api.repository.remote_remove upon call to remove', async () => {
    const name = 'origin'

    await repository_remotes.remove({ name })

    expect(api.repository.remote_remove).toHaveBeenCalledTimes(1)
    expect(api.repository.remote_remove).toHaveBeenCalledWith(name)
  })

  it('should not call credentials.load while repository_remotes.active.name is not set upon call to push', async () => {
    repository_remotes.selected = 'origin'
    repository_remotes.active = {
      name: '',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    await repository_remotes.push()

    expect(repository_credentials.load).not.toHaveBeenCalledWith()
  })

  it('should call credentials.load while repository_remotes.active.name is set upon call to push', async () => {
    repository_remotes.selected = 'origin'
    repository_remotes.active = {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    await repository_remotes.push()

    expect(repository_credentials.load).toHaveBeenCalledWith()
  })

  it('should not call api.repository.push while repository_remotes.active.name is not set upon call to push', async () => {
    repository_remotes.selected = 'origin'
    repository_remotes.active = {
      name: '',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    await repository_remotes.push()

    expect(api.repository.push).not.toHaveBeenCalledWith()
  })

  it('should call api.repository.push while repository_remotes.active.name is set upon call to push', async () => {
    repository_remotes.selected = 'origin'
    repository_remotes.active = {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
      branch: {
        name: 'origin',
        short: 'origin',
      },
      pending: [],
    }

    await repository_remotes.push()

    expect(api.repository.push).toHaveBeenCalledWith()
  })
})
