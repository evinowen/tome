import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import repository, { State as RepositoryState } from '@/store/modules/repository'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  repository: RepositoryState
}

describe('store/modules/repository', () => {
  let store

  let configuration

  const log = vi.fn()

  beforeEach(() => {
    configuration = {
      namespaced: true,
      actions: {
        read: vi.fn(),
      },
    }

    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { repository, configuration },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load and initalize the repository on dispatch of load action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(store.state.repository).toBeDefined()
    expect(store.state.repository).not.toBeUndefined()
  })

  it('should reset the repository state on dispatch of clear action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    await store.dispatch('repository/clear')

    expect(store.state.repository).toBeDefined()
    expect(store.state.repository.repository).toBeUndefined()
  })

  it('should instruct the repository to load remote by url on dispatch of remote action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const name = 'origin'

    await store.dispatch('repository/remote', name)

    expect(mocked_api.repository.remote_load).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to push to loaded remote on dispatch of push action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const name = 'origin'

    await store.dispatch('repository/remote', name)

    await store.dispatch('repository/push')

    expect(mocked_api.repository.push).toHaveBeenCalledTimes(1)
  })

  it('should store metadata file locations on dispatch of metadata action', async () => {
    const readme = '/readme.md'

    await store.dispatch('repository/metadata', { readme })

    expect(store.state.repository.metadata.readme).toEqual(readme)
  })

  it('should store metadata file locations on dispatch of metadata action', async () => {
    const readme = '/readme.md'

    await store.dispatch('repository/metadata', { readme })

    expect(store.state.repository.metadata.readme).toEqual(readme)
  })
})
