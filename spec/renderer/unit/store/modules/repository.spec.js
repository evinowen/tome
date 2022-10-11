import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'

import repository from '@/store/modules/repository'
import { cloneDeep } from 'lodash'

import builders from '?/builders'

Object.assign(window, builders.window())

describe('store/modules/repository', () => {
  let localVue
  let store

  let root_actions
  let configuration

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    root_actions = {
      message: jest.fn(),
      error: jest.fn()
    }

    configuration = {
      namespaced: true,
      actions: {
        read: jest.fn()
      }
    }

    store = new Vuex.Store(cloneDeep({
      actions: root_actions,
      modules: { repository, configuration }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load and initalize the repository on dispatch of load action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(store.state.repository).toBeDefined()
    expect(store.state.repository).not.toBeNull()
  })

  it('should reset the repository state on dispatch of clear action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    await store.dispatch('repository/clear')

    expect(store.state.repository).toBeDefined()
    expect(store.state.repository.repository).toBeDefined()
    expect(store.state.repository.repository).toBeNull()
  })

  it('should instruct the repository to stage the query on dispatch of stage action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(window.api.repository.load).toHaveBeenCalledTimes(1)

    await store.dispatch('repository/stage', './path.md')

    expect(window.api.repository.stage).toHaveBeenCalledTimes(1)
  })

  it('should dispatch error when file fails to stage on dispatch of stage action', async () => {
    window.api.repository.stage.mockImplementationOnce((query, callback) => { throw new Error('Error!') })

    await store.dispatch('repository/load', '/path/to/repository')

    try {
      await store.dispatch('repository/stage', './path.md')
    } catch {
      // do nothing
    }

    expect(root_actions.error).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    await store.dispatch('repository/reset', './path.md')

    expect(window.api.repository.reset).toHaveBeenCalledTimes(1)
  })

  it('should dispatch error when file fails to reset on dispatch of reset action', async () => {
    window.api.repository.reset.mockImplementationOnce((query, callback) => { throw new Error('Error!') })

    await store.dispatch('repository/load', '/path/to/repository')

    try {
      await store.dispatch('repository/reset', './path.md')
    } catch {
      // do nothing
    }

    expect(root_actions.error).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    expect(window.api.repository.inspect).toHaveBeenCalledTimes(1)

    await store.dispatch('repository/inspect')

    expect(window.api.repository.inspect).toHaveBeenCalledTimes(2)
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const path = './path.md'

    await store.dispatch('repository/diff', { path })

    expect(window.api.repository.diff_path).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const commit = {}

    await store.dispatch('repository/diff', { commit })

    expect(window.api.repository.diff_commit).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit'
    }

    await store.dispatch('repository/commit', data)

    expect(window.api.repository.commit).toHaveBeenCalledTimes(1)
  })

  it('should clear staging counter on dispatch of commit action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')
    await store.dispatch('repository/staging', true)

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit'
    }

    expect(store.state.repository.staging).toBeGreaterThan(0)

    await store.dispatch('repository/commit', data)

    expect(store.state.repository.staging).toEqual(0)
  })

  it('should instruct the repository to load remote by url on dispatch of remote action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const credentials = {
      key: './test_rsa',
      passphrase: '1234'
    }

    await store.dispatch('repository/credentials/key', credentials.key)
    await store.dispatch('repository/credentials/passphrase', credentials.passphrase)

    const name = 'origin'

    await store.dispatch('repository/remote', name)

    expect(window.api.repository.load_remote_url).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to push to loaded remote on dispatch of push action', async () => {
    await store.dispatch('repository/load', '/path/to/repository')

    const credentials = {
      key: './test_rsa',
      passphrase: '1234'
    }

    await store.dispatch('repository/credentials/key', credentials.key)
    await store.dispatch('repository/credentials/passphrase', credentials.passphrase)

    const name = 'origin'

    await store.dispatch('repository/remote', name)

    await store.dispatch('repository/push')

    expect(window.api.repository.push).toHaveBeenCalledTimes(1)
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
