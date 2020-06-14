import { remote } from 'electron'
import NodeGit from 'nodegit'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import tome from '@/store/modules/tome'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

const repository = {
  getStatus: jest.fn((cb) => Promise.resolve([
    { path: () => '/test/1', isNew: () => true, isModified: () => false, isRenamed: () => false, isDeleted: () => false, },
    { path: () => '/test/2', isNew: () => false, isModified: () => true, isRenamed: () => false, isDeleted: () => false, },
    { path: () => '/test/3', isNew: () => false, isModified: () => false, isRenamed: () => true, isDeleted: () => false, },
    { path: () => '/test/4', isNew: () => false, isModified: () => false, isRenamed: () => false, isDeleted: () => true, },
    { path: () => '/test/5', isNew: () => false, isModified: () => false, isRenamed: () => false, isDeleted: () => false, }
  ])),
  headDetached: jest.fn(() => false),
  isMerging: jest.fn(() => false),
  isRebasing: jest.fn(() => false),
  headUnborn: jest.fn(() => false),
  head: jest.fn(() => ({ shorthand: () => 'master' }))
}

jest.mock('nodegit', () => ({}))

const fs = {
  readFileSync: jest.fn((path, options) => "# Header\n"),
  existsSync: jest.fn((path) => true)
}

const path = {
  join: jest.fn(),
  basename: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

NodeGit.Repository = {
  open: jest.fn((path) => repository),
  init: jest.fn((path, is_bare) => repository),
}
NodeGit.StatusOptions = jest.fn()
NodeGit.Status = {
  SHOW: {
    INDEX_AND_WORKDIR: 0,
    INDEX_ONLY: 1,
    WORKDIR_ONLY: 2
  },
  OPT: {
    INCLUDE_UNTRACKED: 1,
    INCLUDE_IGNORED: 2,
    INCLUDE_UNMODIFIED: 4,
    EXCLUDE_SUBMODULES: 8,
    RECURSE_UNTRACKED_DIRS: 16,
    DISABLE_PATHSPEC_MATCH: 32,
    RECURSE_IGNORED_DIRS: 64,
    RENAMES_HEAD_TO_INDEX: 128,
    RENAMES_INDEX_TO_WORKDIR: 256,
    SORT_CASE_SENSITIVELY: 512,
    SORT_CASE_INSENSITIVELY: 1024,
    RENAMES_FROM_REWRITES: 2048,
    NO_REFRESH: 4096,
    UPDATE_INDEX: 8192,
    INCLUDE_UNREADABLE: 16384,
    INCLUDE_UNREADABLE_AS_UNTRACKED: 32768
  }
}

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

  it('should populate empty values when initalized', async () => {
    expect(store.state.tome.name).toBe('')
    expect(store.state.tome.path).toBe('')
    expect(store.state.tome.repository).toBe(null)
    expect(store.state.tome.ready).toBe(false)
    expect(store.state.tome.branch.name).toBe('')
    expect(store.state.tome.branch.error).toBe('')
    expect(store.state.tome.status.staged.new).toBe(0)
    expect(store.state.tome.status.staged.renamed).toBe(0)
    expect(store.state.tome.status.staged.modified).toBe(0)
    expect(store.state.tome.status.staged.deleted).toBe(0)
    expect(store.state.tome.status.staged.items).toEqual([])
    expect(store.state.tome.status.available.new).toBe(0)
    expect(store.state.tome.status.available.renamed).toBe(0)
    expect(store.state.tome.status.available.modified).toBe(0)
    expect(store.state.tome.status.available.deleted).toBe(0)
    expect(store.state.tome.status.available.items).toEqual([])

    expect(store.state.tome.undefined).toBeUndefined()
  })

  it('set error message on a load event if a repository cannot be loaded or created at the target', async () => {
    NodeGit.Repository.open.mockReturnValueOnce(null)

    expect(store.state.tome.branch.error).toBe('')

    await store.dispatch('load', '/path/to/file')

    expect(store.state.tome.branch.error).toBe('No Repository!')
  })

  it('set error message on a load event if the repository head is detached at the target', async () => {
    repository.headDetached.mockReturnValueOnce(true)

    expect(store.state.tome.branch.error).toBe('')

    await store.dispatch('load', '/path/to/file')

    expect(store.state.tome.branch.error).toBe('Head Detached')
  })

  it('set error message on a load event if the repository head at the target in the middle of a merge', async () => {
    repository.isMerging.mockReturnValueOnce(true)

    expect(store.state.tome.branch.error).toBe('')

    await store.dispatch('load', '/path/to/file')

    expect(store.state.tome.branch.error).toBe('Merging')
  })

  it('set error message on a load event if the repository head at the target in the middle of a rebase', async () => {
    repository.isRebasing.mockReturnValueOnce(true)

    expect(store.state.tome.branch.error).toBe('')

    await store.dispatch('load', '/path/to/file')

    expect(store.state.tome.branch.error).toBe('Rebasing')
  })

  it('load the provided target repository on a load event if a repository exists at the target', async () => {
    expect(NodeGit.Repository.open).toHaveBeenCalledTimes(0)

    await store.dispatch('load', '/path/to/file')

    expect(NodeGit.Repository.open).toHaveBeenCalledTimes(1)
  })

  it('load the provided target repository on a load event if a repository exists at the target even if head is unborn', async () => {
    fs.readFileSync.mockReturnValueOnce("ref: refs/heads/master\r\n")
    repository.headUnborn.mockReturnValueOnce(true)

    expect(NodeGit.Repository.open).toHaveBeenCalledTimes(0)

    await store.dispatch('load', '/path/to/file')

    expect(NodeGit.Repository.open).toHaveBeenCalledTimes(1)
  })

  it('create a new repository on a load event if a repository does not exist at the target', async () => {
    fs.existsSync.mockReturnValueOnce(false)

    expect(NodeGit.Repository.init).toHaveBeenCalledTimes(0)

    await store.dispatch('load', '/path/to/file')

    expect(NodeGit.Repository.init).toHaveBeenCalledTimes(1)
  })

  it('read the current state of the repository on an inspect event', async () => {

    await store.dispatch('load', '/path/to/file')

    expect(store.state.tome.status.staged.items.length).toBe(0)
    expect(store.state.tome.status.available.items.length).toBe(0)

    await store.dispatch('inspect')

    expect(store.state.tome.status.staged.new).toBe(1)
    expect(store.state.tome.status.staged.renamed).toBe(1)
    expect(store.state.tome.status.staged.modified).toBe(1)
    expect(store.state.tome.status.staged.deleted).toBe(1)
    expect(store.state.tome.status.staged.items.length).toBe(5)
    expect(store.state.tome.status.available.new).toBe(1)
    expect(store.state.tome.status.available.renamed).toBe(1)
    expect(store.state.tome.status.available.modified).toBe(1)
    expect(store.state.tome.status.available.deleted).toBe(1)
    expect(store.state.tome.status.available.items.length).toBe(5)
  })
})
