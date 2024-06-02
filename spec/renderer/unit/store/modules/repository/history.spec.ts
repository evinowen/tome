import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_history_store } from '@/store/modules/repository/history'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/history', () => {
  let repository_history

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_history = fetch_repository_history_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.history_list for page one upon load action dispatch', async () => {
    await repository_history.load()

    expect(mocked_api.repository.history_list).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(1)
  })

  it('should not trigger api.repository.history_list when not loaded upon page action dispatch', async () => {
    await repository_history.page()

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })

  it('should trigger api.repository.history_list when loaded upon page action dispatch', async () => {
    await repository_history.load()

    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(1)

    await repository_history.page()

    expect(mocked_api.repository.history_list).toHaveBeenCalledWith(2)
  })

  it('should not trigger api.repository.history_list when root found during load call upon page action dispatch', async () => {
    mocked_api.repository.history_list.mockReturnValueOnce([ { root: true } ])

    await repository_history.load()

    mocked_api.repository.history_list.mockClear()

    await repository_history.page()

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })

  it('should not trigger api.repository.history_list when root found during page call upon page action dispatch', async () => {
    await repository_history.load()

    mocked_api.repository.history_list.mockClear()
    mocked_api.repository.history_list.mockReturnValueOnce([ { root: true } ])

    await repository_history.page()

    mocked_api.repository.history_list.mockClear()

    await repository_history.page()

    expect(mocked_api.repository.history_list).not.toHaveBeenCalled()
  })
})
