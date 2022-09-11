import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'

import tome from '@/store/modules/tome'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

describe('store/modules/tome.js', () => {
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
      modules: { tome, configuration }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load and initalize the tome repository on dispatch of load action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    expect(store.state.repository).not.toBeNull()
  })

  it('should reset the tome state on dispatch of clear action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/clear')

    expect(store.state.repository).toBeUndefined()
  })

  it('should instruct the repository to stage the query on dispatch of stage action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    expect(window.api.load_repository).toHaveBeenCalledTimes(1)

    await store.dispatch('tome/stage', './path.md')

    expect(window.api.stage_repository).toHaveBeenCalledTimes(1)
  })

  it('should dispatch error when file fails to stage on dispatch of stage action', async () => {
    window.api.stage_repository.mockImplementationOnce((query, callback) => { throw new Error('Error!') })

    await store.dispatch('tome/load', '/path/to/repository')

    try {
      await store.dispatch('tome/stage', './path.md')
    } catch (_) {}

    expect(root_actions.error).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/reset', './path.md')

    expect(window.api.reset_repository).toHaveBeenCalledTimes(1)
  })

  it('should dispatch error when file fails to reset on dispatch of reset action', async () => {
    window.api.reset_repository.mockImplementationOnce((query, callback) => { throw new Error('Error!') })

    await store.dispatch('tome/load', '/path/to/repository')

    try {
      await store.dispatch('tome/reset', './path.md')
    } catch (_) {}

    expect(root_actions.error).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    expect(window.api.inspect_repository).toHaveBeenCalledTimes(1)

    await store.dispatch('tome/inspect')

    expect(window.api.inspect_repository).toHaveBeenCalledTimes(2)
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const path = './path.md'

    await store.dispatch('tome/diff', { path })

    expect(window.api.diff_path_repository).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const commit = {}

    await store.dispatch('tome/diff', { commit })

    expect(window.api.diff_commit_repository).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit'
    }

    await store.dispatch('tome/commit', data)

    expect(window.api.commit_repository).toHaveBeenCalledTimes(1)
  })

  it('should clear staging counter on dispatch of commit action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')
    await store.dispatch('tome/staging', true)

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit'
    }

    expect(store.state.tome.staging).toBeGreaterThan(0)

    await store.dispatch('tome/commit', data)

    expect(store.state.tome.staging).toEqual(0)
  })

  it('should instruct the repository to load remote by url on dispatch of remote action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const credentials = {
      key: './test_rsa',
      passphrase: '1234'
    }

    await store.dispatch('tome/credentials/key', credentials.key)
    await store.dispatch('tome/credentials/passphrase', credentials.passphrase)

    const name = 'origin'

    await store.dispatch('tome/remote', name)

    expect(window.api.load_remote_url_repository).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to push to loaded remote on dispatch of push action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const credentials = {
      key: './test_rsa',
      passphrase: '1234'
    }

    await store.dispatch('tome/credentials/key', credentials.key)
    await store.dispatch('tome/credentials/passphrase', credentials.passphrase)

    const name = 'origin'

    await store.dispatch('tome/remote', name)

    await store.dispatch('tome/push')

    expect(window.api.push_repository).toHaveBeenCalledTimes(1)
  })

  it('should store metadata file locations on dispatch of metadata action', async () => {
    const readme = '/readme.md'

    await store.dispatch('tome/metadata', { readme })

    expect(store.state.tome.metadata.readme).toEqual(readme)
  })

  it('should store metadata file locations on dispatch of metadata action', async () => {
    const readme = '/readme.md'

    await store.dispatch('tome/metadata', { readme })

    expect(store.state.tome.metadata.readme).toEqual(readme)
  })

  it('should store signature data on dispatch of signature actions', async () => {
    const name = 'Fred'
    const email = 'fred@example.com'

    await store.dispatch('tome/signature/name', name)
    await store.dispatch('tome/signature/email', email)

    expect(store.state.tome.signature.name).toEqual(name)
    expect(store.state.tome.signature.email).toEqual(email)
  })

  it('should store commit message on dispatch of message action', async () => {
    const message = 'Commit Message'

    await store.dispatch('tome/signature/message', message)

    expect(store.state.tome.signature.message).toEqual(message)
  })
})
