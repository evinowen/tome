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

  it('should instruct the repository to stage the query on dispatch of stage action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(mocked_api.repository.load).toHaveBeenCalledTimes(1)

    await store.dispatch('repository/stage', './path.md')

    expect(mocked_api.repository.stage).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    await store.dispatch('repository/reset', './path.md')

    expect(mocked_api.repository.reset).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(mocked_api.repository.inspect).toHaveBeenCalledTimes(1)

    await store.dispatch('repository/inspect')

    expect(mocked_api.repository.inspect).toHaveBeenCalledTimes(2)
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const path = './path.md'

    await store.dispatch('repository/diff', { path })

    expect(mocked_api.repository.diff_path).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const commit = {}

    await store.dispatch('repository/diff', { commit })

    expect(mocked_api.repository.diff_commit).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    await store.dispatch('repository/commit', data)

    expect(mocked_api.repository.commit).toHaveBeenCalledTimes(1)
  })

  it('should clear staging counter on dispatch of commit action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')
    await store.dispatch('repository/staging', true)

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    expect(store.state.repository.staging).toBeGreaterThan(0)

    await store.dispatch('repository/commit', data)

    expect(store.state.repository.staging).toEqual(0)
  })

  it('should instruct the repository to load remote by url on dispatch of remote action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const name = 'origin'

    await store.dispatch('repository/remote', name)

    expect(mocked_api.repository.load_remote_url).toHaveBeenCalledTimes(1)
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

  it('should store signature data on dispatch of signature actions', async () => {
    const name = 'Fred'
    const email = 'fred@example.com'

    await store.dispatch('repository/signature/name', name)
    await store.dispatch('repository/signature/email', email)

    expect(store.state.repository.signature.name).toEqual(name)
    expect(store.state.repository.signature.email).toEqual(email)
  })

  it('should store commit message on dispatch of message action', async () => {
    const message = 'Commit Message'

    await store.dispatch('repository/signature/message', message)

    expect(store.state.repository.signature.message).toEqual(message)
  })
})
