import Vuex from 'vuex'
import Repository from '@/store/modules/tome/Repository'

import { createLocalVue } from '@vue/test-utils'

import tome from '@/store/modules/tome'
import { cloneDeep } from 'lodash'

jest.mock('@/store/modules/tome/Repository', () => jest.fn())
jest.mock('@/store/modules/tome/RepositoryFile', () => jest.fn())
jest.mock('@/store/modules/tome/RepositoryPatch', () => jest.fn())

const repository = {
  load: jest.fn(),
  stage: jest.fn(),
  reset: jest.fn(),
  inspect: jest.fn(),
  diffPath: jest.fn(),
  diffCommit: jest.fn(),
  commit: jest.fn(),
  storeCredentials: jest.fn(),
  loadRemoteBranch: jest.fn(),
  push: jest.fn()
}

Repository.mockImplementation(() => repository)

describe('store/modules/tome.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({ modules: { tome } }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load and initalize the tome repository on dispatch of load action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    expect(Repository).toHaveBeenCalledTimes(1)
    expect(store.state.repository).not.toBeNull()
  })

  it('should reset the tome state on dispatch of clear action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/clear')

    expect(store.state.repository).toBeUndefined()
  })

  it('should instruct the repository to stage the query on dispatch of stage action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/stage', './path.md')

    expect(repository.stage).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/reset', './path.md')

    expect(repository.reset).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    expect(repository.inspect).toHaveBeenCalledTimes(1)

    await store.dispatch('tome/inspect')

    expect(repository.inspect).toHaveBeenCalledTimes(2)
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const path = './path.md'

    await store.dispatch('tome/diff', { path })

    expect(repository.diffPath).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const commit = {}

    await store.dispatch('tome/diff', { commit })

    expect(repository.diffCommit).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit'
    }

    await store.dispatch('tome/commit', data)

    expect(repository.commit).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to store credentials on dispatch of credentials action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const credentials = {
      private_key: './test_rsa',
      public_key: './test_rsa.pub',
      passphrase: '1234'
    }

    await store.dispatch('tome/credentials', credentials)

    expect(repository.storeCredentials).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to load remote by url on dispatch of remote action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    const url = 'git@git.example.com:remote.git'

    await store.dispatch('tome/remote', url)

    expect(repository.loadRemoteBranch).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to push to loaded remote on dispatch of push action', async () => {
    await store.dispatch('tome/load', '/path/to/repository')

    await store.dispatch('tome/push')

    expect(repository.push).toHaveBeenCalledTimes(1)
  })
})
