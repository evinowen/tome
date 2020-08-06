import { remote } from 'electron'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

import { createLocalVue } from '@vue/test-utils'
import files from '@/store/modules/files'

jest.mock('electron', () => ({ remote: {} }))

const _fs_isDirectory_factory = (name) => () => (['first', 'second', 'third'].indexOf(name) !== -1)

const _path_dirname = path => {
  switch (path) {
    case '/project/first': return '/project'
    case '/project/second': return '/project'
    case '/project/third': return '/project'
    case '/project/first/a.md': return '/project/first'
    case '/project/first/b.md': return '/project/first'
    case '/project/first/c.md': return '/project/first'
    case '/project/second/b.md': return '/project/second'
    case '/project/second/c.md': return '/project/second'
    case '/project/third/c.txt': return '/project/third'
  }
}

const _path_basename = path => {
  switch (path) {
    case '/project/first': return 'first'
    case '/project/second': return 'second'
    case '/project/third': return 'third'
    case '/project/first/a.md': return 'a.md'
    case '/project/first/b.md': return 'b.md'
    case '/project/first/c.md': return 'c.md'
    case '/project/second/b.md': return 'b.md'
    case '/project/second/c.md': return 'c.md'
    case '/project/third/c.txt': return 'c.txt'
  }
}

const _path_relative = (first, second) => {
  switch (second) {
    case '/project': return ''
    case '/project/first': return 'first'
    case '/project/second': return 'second'
    case '/project/third': return 'third'
    case '/project/first/a.md': return 'first/a.md'
    case '/project/first/b.md': return 'first/b.md'
    case '/project/first/c.md': return 'first/c.md'
    case '/project/second/b.md': return 'second/b.md'
    case '/project/second/c.md': return 'second/c.md'
    case '/project/third/c.txt': return 'third/c.txt'
  }
}

const _lstat_result = (path) => ({
  isDirectory: jest.fn(_fs_isDirectory_factory(_path_basename(path)))
})

const _readdir_result = (...names) => names.map(name => ({
  name,
  isDirectory: jest.fn(_fs_isDirectory_factory(name))
}))

const _readdir = (path) => {
  console.log('_readdir_readdir_readdir', path)
  switch (path) {
    case '/project': return _readdir_result('first', 'second', 'third')
    case '/project/first': return _readdir_result('a.md', 'b.md', 'c.md')
    case '/project/second': return _readdir_result('b.md', 'c.md')
    case '/project/third': return _readdir_result('c.txt')
  }
  console.log('_readdir_readdir_readdir FAIL FAIL FAIL ', path)
}

const fs = {
  readdir: jest.fn((path, options, callback) => (callback ?? options)(0, _readdir(path))),
  readFileSync: jest.fn((path, options) => '# Header\nContent'),
  writeFile: jest.fn((file, data, options, callback) => (callback ?? options)(null)),
  mkdir: jest.fn((path, options, callback) => (callback ?? options)(null)),
  unlink: jest.fn((handler, callback) => callback(null, 1)),
  rename: jest.fn((current_path, proposed_path, callback) => callback(null)),
  access: jest.fn((path, callback) => callback(new Error('error!'))),
  lstat: jest.fn((path, callback) => callback(null, _lstat_result(path)))
}

const path = {
  sep: '/',
  dirname: jest.fn(_path_dirname),
  basename: jest.fn(_path_basename),
  relative: jest.fn(_path_relative),
  join: jest.fn((first, second) => `${first}/${second}`),
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
    const path = '/project'

    expect(store.state.files.tree).toBeNull()

    await store.dispatch('files/initialize', { path })

    expect(store.state.files.tree).not.toBeNull()
  })

  it('should load children for an item on populate', async () => {
    const path = '/project'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })

    const { item } = store.state.files.tree.identify(path)

    expect(item).not.toBeNull()
    expect(item.children.length).toBeGreaterThan(0)
  })

  it('should expand a collapsed item on toggle', async () => {
    const path = '/project'
    const target = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })

    const { item } = store.state.files.tree.identify(target)

    expect(item.expanded).toBeFalsy()

    await store.dispatch('files/toggle', { path: target })

    expect(item.expanded).toBeTruthy()
  })

  it('should collapse an expanded item on toggle', async () => {
    const path = '/project'
    const target = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/toggle', { path: target })

    const { item } = store.state.files.tree.identify(target)

    expect(item.expanded).toBeTruthy()

    await store.dispatch('files/toggle', { path: target })

    expect(item.expanded).toBeFalsy()
  })

  it('should set the selected path as active on select', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    expect(store.state.files.active).toBeNull()

    await store.dispatch('files/select', { path: target })

    expect(store.state.files.active).not.toBeNull()
  })

  it('should load the content from targed item on select when the item is a markdown file', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    expect(store.state.files.content).toBeNull()

    await store.dispatch('files/select', { path: target })

    expect(store.state.files.content).not.toBeNull()
  })

  it('should store and update the content of the selected item on save', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/select', { path: target })

    const content = 'Test Content'

    expect(store.state.files.content).not.toEqual(content)

    await store.dispatch('files/save', { content })

    expect(store.state.files.content).toEqual(content)
  })

  it('should create a new directory item on submit when directory item is ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/ghost', { path: directory, directory: true })

    const { item } = store.state.files.tree.identify(directory)

    expect(item.directory).toBeTruthy()
    expect(fs.mkdir).toHaveBeenCalledTimes(0)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    expect(fs.mkdir).toHaveBeenCalledTimes(1)
  })

  it('should create a new folder item on submit when folder item is ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/ghost', { path: directory, directory: false })

    const { item } = store.state.files.tree.identify(directory)

    expect(item.directory).toBeTruthy()
    expect(fs.writeFile).toHaveBeenCalledTimes(0)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })

  it('should rename item on submit when item is not ephemeral', async () => {
    const path = '/project'
    const directory = '/project/first'
    const input = 'new'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    const { item: item_before } = store.state.files.tree.identify(directory)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    const { item: item_after } = store.state.files.tree.identify(path)

    expect(item_after.name).not.toBe(item_before.name)
  })

  it('should relocate item on move', async () => {
    const path = '/project'
    const directory = '/project/third'
    const proposed = '/project/forth'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    const { item: item_before } = store.state.files.tree.identify(directory)

    await store.dispatch('files/move', { path: directory, proposed })

    expect(item_before.path).toBe(proposed)
  })

  it('should remove item on delete', async () => {
    const path = '/project'
    const directory = '/project/third'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })

    const { item: item_before } = store.state.files.tree.identify(directory)

    expect(item_before).not.toBeNull()

    await store.dispatch('files/delete', { path: directory })

    const { item: item_after } = store.state.files.tree.identify(directory)

    expect(item_after).toBeNull()
  })
})
