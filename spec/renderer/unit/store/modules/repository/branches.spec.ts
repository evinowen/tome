import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import branches, { State as BranchesState } from '@/store/modules/repository/branches'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  remotes: BranchesState
}

describe('store/modules/repository/branches', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { branches },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.branch_status upon load load dispatch', async () => {
    await store.dispatch('branches/load')

    expect(mocked_api.repository.branch_status).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.branch_create upon load create dispatch', async () => {
    const name = 'master'

    await store.dispatch('branches/create', name)

    expect(mocked_api.repository.branch_create).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_create).toHaveBeenCalledWith(name)
  })

  it('should trigger api.repository.branch_select upon load select dispatch', async () => {
    const name = 'master'

    await store.dispatch('branches/select', name)

    expect(mocked_api.repository.branch_select).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_select).toHaveBeenCalledWith(name)
  })

  it('should trigger api.repository.branch_rename upon load rename dispatch', async () => {
    const name = 'master'
    const value = 'main'

    await store.dispatch('branches/rename', { name, value })

    expect(mocked_api.repository.branch_rename).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_rename).toHaveBeenCalledWith(name, value)
  })

  it('should trigger api.repository.branch_remove upon load remove dispatch', async () => {
    const name = 'master'
    await store.dispatch('branches/remove', name)

    expect(mocked_api.repository.branch_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_remove).toHaveBeenCalledWith(name)
  })
})
