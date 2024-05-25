import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import committer, { State as CommitterState } from '@/store/modules/repository/committer'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import { reset_inspect } from '?/builders/api/repository'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  committer: CommitterState
}

describe('store/modules/repository/committer', () => {
  let store

  const log = vi.fn()

  beforeEach(() => {
    reset_inspect()

    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: { committer },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    await store.dispatch('committer/commit', data)

    expect(mocked_api.repository.commit).toHaveBeenCalledTimes(1)
  })

  it('should clear staging counter on dispatch of commit action', async () => {
    await store.dispatch('committer/staging', true)

    expect(store.state.committer.staging).toBeGreaterThan(0)

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    await store.dispatch('committer/commit', data)

    expect(store.state.committer.staging).toEqual(0)
  })

  it('should instruct the repository to stage the query on dispatch of stage', async () => {
    await store.dispatch('committer/stage', '/test.file.1.md')

    expect(mocked_api.repository.stage).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset', async () => {
    await store.dispatch('committer/reset', '/test.file.1.md')

    expect(mocked_api.repository.reset).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect', async () => {
    await store.dispatch('committer/inspect')

    expect(mocked_api.repository.inspect).toHaveBeenCalledTimes(1)
  })

  it('should return false if staged is larger than zero upon dispatch of staged', async () => {
    expect(store.state.committer.status.staged).toHaveLength(0)

    const result = await store.dispatch('committer/staged')

    expect(result).toEqual(false)
  })

  it('should return true if staged is larger than zero upon dispatch of staged', async () => {
    await store.dispatch('committer/stage', '/test.file.1.md')

    expect(store.state.committer.status.staged).toHaveLength(1)

    const result = await store.dispatch('committer/staged')

    expect(result).toEqual(true)
  })
})
