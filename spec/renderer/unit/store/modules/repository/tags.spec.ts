import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import tags, { State as TagsState } from '@/store/modules/repository/tags'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  tags: TagsState
}

describe('store/modules/repository/branches', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { tags },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.tag_list upon load load dispatch', async () => {
    await store.dispatch('tags/load')

    expect(mocked_api.repository.tag_list).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.tag_remove upon load remove dispatch', async () => {
    const name = 'v1.0.0'
    await store.dispatch('tags/remove', name)

    expect(mocked_api.repository.tag_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.tag_remove).toHaveBeenCalledWith(name)
  })
})
