import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import comparator, { State as ComparatorState } from '@/store/modules/repository/comparator'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  comparator: ComparatorState
}

describe('store/modules/repository/comparator', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: {
        comparator,
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    const path = './path.md'

    await store.dispatch('comparator/diff', { path })

    expect(mocked_api.repository.diff_path).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    const commit = {}

    await store.dispatch('comparator/diff', { commit })

    expect(mocked_api.repository.diff_commit).toHaveBeenCalledTimes(1)
  })
})
