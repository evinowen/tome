import { remote } from 'electron'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

import { createLocalVue } from '@vue/test-utils'
import files from '@/store/modules/files'

jest.mock('electron', () => ({ remote: {} }))

const _lstat = {
  isDirectory: jest.fn(() => true)
}

const children = []

const fs = {
  readdir: jest.fn((handler, options, callback) => (callback ?? options)(0, children)),
  readFileSync: jest.fn((path, options) => '# Header\nContent'),
  writeFile: jest.fn((file, data, options, callback) => (callback ?? options)(null)),
  mkdir: jest.fn((path, options, callback) => (callback ?? options)(null)),
  unlink: jest.fn((handler, callback) => callback(null, 1)),
  rename: jest.fn((current_path, proposed_path, callback) => callback(null)),
  access: jest.fn((path, callback) => callback(new Error('error!'))),
  lstat: jest.fn((path, callback) => callback(null, _lstat))
}

const path = {
  dirname: jest.fn(path => {
    switch (path) {
      case '/project/first': return '/project'
      case '/project/second': return '/project'
      case '/project/third': return '/project'
      case '/project/first/a': return '/project/first'
      case '/project/first/b': return '/project/first'
      case '/project/first/c': return '/project/first'
      case '/project/second/b': return '/project/second'
      case '/project/second/c': return '/project/second'
      case '/project/third/c': return '/project/third'
    }
    return '/directory'
  }),
  basename: jest.fn(path => {
    switch (path) {
      case '/project/first': return 'first'
      case '/project/second': return 'second'
      case '/project/third': return 'third'
      case '/project/first/a': return 'a'
      case '/project/first/b': return 'b'
      case '/project/first/c': return 'c'
      case '/project/second/b': return 'b'
      case '/project/second/c': return 'c'
      case '/project/third/c': return 'c'
    }
    return '/'
  }),
  join: jest.fn((first, second) => `${first}${second}`),
  extname: jest.fn(path => '.md')
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

describe('store/modules/files', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({ modules: { files } }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should construct the file tree on initialize', async () => {
  })

  it('should expand a collapsed item on toggle', async () => {
  })

  it('should collapse an expanded item on toggle', async () => {
  })

  it('should load an items children on populate', async () => {
  })

  it('should load the content from targed item on select when the item is a markdown file', async () => {
  })

  it('should load the content from targed item on select when the item is a markdown file', async () => {
  })

  it('should store and update the content of selected item on save', async () => {
  })

  it('should create a new item on submit when item is ephemeral', async () => {
  })

  it('should rename item on submit when item is not ephemeral', async () => {
  })

  it('should move item on submit when item is not ephemeral', async () => {
  })

  it('should relocate item on move', async () => {
  })

  it('should relocate item on move', async () => {
  })

  it('should remove item on delete', async () => {
  })
})
