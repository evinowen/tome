import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import history, { State as HistoryState } from '@/store/modules/repository/history'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  history: HistoryState
}

describe('store/modules/repository/history', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { history },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.history_list for page one upon load action dispatch', async () => {
    await store.dispatch('history/load')

    expect(mocked_api.repository.history_list).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(1)
  })

  it('should not trigger api.repository.history_list when loaded upon load action dispatch', async () => {
    await store.dispatch('history/load')

    expect(mocked_api.repository.history_list).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(1)

    mocked_api.repository.history_list.mockClear()

    await store.dispatch('history/load')

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })

  it('should not trigger api.repository.history_list when not loaded upon page action dispatch', async () => {
    await store.dispatch('history/page')

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })

  it('should trigger api.repository.history_list when loaded upon page action dispatch', async () => {
    await store.dispatch('history/load')

    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(1)

    await store.dispatch('history/page')

    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(2)
  })

  it('should not trigger api.repository.history_list when root found during load call upon page action dispatch', async () => {
    mocked_api.repository.history_list.mockReturnValueOnce([ { root: true } ])

    await store.dispatch('history/load')

    mocked_api.repository.history_list.mockClear()

    await store.dispatch('history/page')

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })

  it('should not trigger api.repository.history_list when root found during page call upon page action dispatch', async () => {
    await store.dispatch('history/load')

    mocked_api.repository.history_list.mockClear()
    mocked_api.repository.history_list.mockReturnValueOnce([ { root: true } ])

    await store.dispatch('history/page')

    mocked_api.repository.history_list.mockClear()

    await store.dispatch('history/page')

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })
})
