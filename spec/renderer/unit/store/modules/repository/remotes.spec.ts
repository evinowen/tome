import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import remotes, { State as RemotesState } from '@/store/modules/repository/remotes'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  remotes: RemotesState
}

describe('store/modules/repository/remotes', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { remotes },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.remote_list upon load action dispatch', async () => {
    await store.dispatch('remotes/load')

    expect(mocked_api.repository.remote_list).toHaveBeenCalledTimes(1)
  })

  it('should populate list from api.repository.remote_list return upon load action dispatch', async () => {
    const list = [
      { name: 'origin', url: 'git@127.0.0.1:username/example.git' },
    ]

    mocked_api.repository.remote_list.mockReturnValueOnce(list)
    await store.dispatch('remotes/load')

    expect(store.state.remotes.list).toEqual(list)
  })

  it('should call api.repository.remote_add upon add action dispatch', async () => {
    const name = 'origin'
    const url = 'git@127.0.0.1:username/example.git'

    await store.dispatch('remotes/add', { name, url })

    expect(mocked_api.repository.remote_add).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.remote_add).toHaveBeenCalledWith(name, url)
  })

  it('should call api.repository.remote_remove upon remove action dispatch', async () => {
    const name = 'origin'

    await store.dispatch('remotes/remove', { name })

    expect(mocked_api.repository.remote_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.remote_remove).toHaveBeenCalledWith(name)
  })
})
