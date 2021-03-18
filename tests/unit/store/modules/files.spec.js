import { remote } from 'electron'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

import { createLocalVue } from '@vue/test-utils'
import files from '@/store/modules/files'

jest.mock('electron', () => ({ remote: {} }))

let disk
const disk_fetch = (path) => {
  const path_split = String(path).replace(/^\/|\/$/, '').split('/')

  let parent
  let name
  let item = disk

  while (path_split.length) {
    parent = item
    name = path_split.shift()
    item = item[name]
  }

  return { parent, name, item }
}

const _fs_isDirectory_factory = (name) => () => (['first', 'second', 'third'].indexOf(name) !== -1)

const _path_dirname = path => String(path).substring(0, String(path).lastIndexOf('/'))
const _path_basename = path => String(path).substring(String(path).lastIndexOf('/') + 1)
const _path_relative = (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).substring(String(first).length + 1) : ''

const _lstat_result = (path) => ({
  isDirectory: jest.fn(_fs_isDirectory_factory(_path_basename(path)))
})

const _readdir_result = (...names) => names.map(name => ({
  name,
  isDirectory: jest.fn(_fs_isDirectory_factory(name))
}))

const _readdir = (path) => {
  const path_split = String(path).replace(/^\/|\/$/, '').split('/')
  let item = disk
  while (path_split.length) item = item[path_split.shift()]

  const files = Object.keys(item)
  return _readdir_result(...files)
}

const fs = {
  readdir: jest.fn((path, options, callback) => (callback ?? options)(0, _readdir(path))),
  readFile: jest.fn((path, encoding, callback) => callback(null, '# Header\nContent')),
  readFileSync: jest.fn((path, options) => '# Header\nContent'),
  writeFile: jest.fn((file, data, options, callback) => (callback ?? options)(null)),
  mkdir: jest.fn((path, options, callback) => (callback ?? options)(null)),
  unlink: jest.fn((path, callback) => {
    const { parent, name } = disk_fetch(path)
    if (!parent) return callback(new Error('error!'))

    delete parent[name]
    return callback(null, 1)
  }),
  rename: jest.fn((current_path, proposed_path, callback) => {
    const { parent: current_parent, name: current_name } = disk_fetch(current_path)
    if (!current_parent) return callback(new Error('error!'))

    const proposed_name = _path_basename(proposed_path)

    const parent_path = _path_dirname(proposed_path)
    const { item: parent_item } = disk_fetch(parent_path)
    if (!parent_item) return callback(new Error('error!'))

    const item = current_parent[current_name]
    delete current_parent[current_name]

    parent_item[proposed_name] = item

    return callback(null, 1)
  }),
  access: jest.fn((path, callback) => callback(new Error('error!'))),
  lstat: jest.fn((path, callback) => callback(null, _lstat_result(path)))
}

const path = {
  sep: '/',
  dirname: jest.fn(_path_dirname),
  basename: jest.fn(_path_basename),
  relative: jest.fn(_path_relative),
  join: jest.fn((first, second) => String(first).replace(/\/$/g, '').concat('/').concat(String(second).replace(/^\/|\/$/g, ''))),
  extname: jest.fn(path => String(path).substr(String(path).lastIndexOf('.')))
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

    disk = {
      'project': {
        '.git': {},
        '.tome': {},
        'first': {
          'a.md': null,
          'b.md': null,
          'c.md': null
        },
        'second': {
          'b.md': null,
          'c.md': null
        },
        'a.md': null,
        'b.md': null,
        'c.md': null,
        'third': {
          'c.md': null
        },
        'x.md': null,
        'y.md': null,
        'z.md': null
      }
    }

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

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    expect(store.state.files.active).toBeNull()

    await store.dispatch('files/select', { path: directory })

    expect(store.state.files.active).not.toBeNull()
  })

  it('should not load the content from targed item on select when the item isnot a markdown file', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/third/c.txt'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })

    expect(store.state.files.content).toBeNull()

    await store.dispatch('files/select', { path: target })

    expect(store.state.files.content).toBeNull()
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

    expect(store.state.files.content).not.toBe(content)

    await store.dispatch('files/save', { content })

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })

  it('should place the ghost adjacent to the target provided', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/ghost', { path: target, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    expect(store.state.files.ghost.parent.path).toBe(directory)
  })

  it('should use the the ghost adjacent to the target provided', async () => {
    const path = '/project'
    const directory = '/project/first'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/ghost', { path: directory, target: 'a.md', directory: true })

    expect(store.state.files.ghost).toBeDefined()
    expect(store.state.files.ghost.parent.path).toBe(directory)
  })

  it('should replace ghost when a ghost already exists', async () => {
    const path = '/project'
    const first = '/project/first'
    const second = '/project/second'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: first })
    await store.dispatch('files/populate', { path: second })
    await store.dispatch('files/ghost', { path: first, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    expect(store.state.files.ghost.parent.path).toBe(first)

    await store.dispatch('files/ghost', { path: second, directory: true })

    expect(store.state.files.ghost).toBeDefined()
    expect(store.state.files.ghost.parent.path).toBe(second)
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

  it('should fail gracefully when creating a new item that already exists', async () => {
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

    fs.access.mockImplementationOnce((path, callback) => callback(null))

    await expect(store.dispatch('files/submit', { path: directory, input, title: false })).rejects.toBeDefined()
  })

  it('should create a new file item on submit when file item is ephemeral', async () => {
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
    await store.dispatch('files/edit', { path: directory })

    const { item: item_before } = store.state.files.tree.identify(directory)

    await store.dispatch('files/submit', { path: directory, input, title: false })

    const { item: item_after } = store.state.files.tree.identify(path)

    expect(item_after.name).not.toBe(item_before.name)
  })

  it('should rename item on submit and reformat correctly when item is not ephemeral and in title mode', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'
    const result = '/project/first/new.file.name.md'
    const input = 'New File Name'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/edit', { path: target })

    const { item: item_before } = store.state.files.tree.identify(target)

    await store.dispatch('files/submit', { path: target, input, title: true })

    const { item: item_after } = store.state.files.tree.identify(result)

    expect(item_after).not.toBeNull()
    expect(item_after.name).not.toBe(item_before.name)
    expect(item_after.path).toBe(result)
    expect(item_after.name).toBe(_path_basename(result))
  })

  it('should clear edit when blur is called while editing', async () => {
    const path = '/project'
    const directory = '/project/first'
    const target = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: directory })
    await store.dispatch('files/edit', { path: target })

    expect(store.state.files.editing).toBeTruthy()

    await store.dispatch('files/blur')

    expect(store.state.files.editing).toBeFalsy()
  })

  it('should relocate item on move', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/second'
    const proposed = '/project/second/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: target_directory })
    await store.dispatch('files/populate', { path: proposed_directory })

    const { item: item_before } = store.state.files.tree.identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed: proposed_directory })

    const { item: item_previous } = store.state.files.tree.identify(target)
    const { item: item_current } = store.state.files.tree.identify(proposed)
    expect(item_previous).toBeNull()
    expect(item_current).toBeDefined()
  })

  it('should relocate item on move to proposed parent if proposed is not a directory', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/second'
    const proposed = '/project/second/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: target_directory })
    await store.dispatch('files/populate', { path: proposed_directory })

    const { item: item_before } = store.state.files.tree.identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed })

    const { item: item_previous } = store.state.files.tree.identify(target)
    const { item: item_current } = store.state.files.tree.identify(proposed)
    expect(item_previous).toBeNull()
    expect(item_current).toBeDefined()
  })

  it('should not relocate item on move if the directory does not change', async () => {
    const path = '/project'
    const target_directory = '/project/first'
    const target = '/project/first/a.md'
    const proposed_directory = '/project/first'
    const proposed = '/project/first/a.md'

    await store.dispatch('files/initialize', { path })
    await store.dispatch('files/populate', { path })
    await store.dispatch('files/populate', { path: target_directory })
    await store.dispatch('files/populate', { path: proposed_directory })

    const { item: item_before } = store.state.files.tree.identify(target)
    expect(item_before).toBeDefined()

    await store.dispatch('files/move', { path: target, proposed: proposed_directory })

    const { item: item_previous } = store.state.files.tree.identify(target)
    const { item: item_current } = store.state.files.tree.identify(proposed)

    expect(item_previous).toEqual(item_current)
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
