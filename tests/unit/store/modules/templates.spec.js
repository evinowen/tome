import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import templates from '@/store/modules/templates'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

let disk

const _path_basename = path => String(path).substring(String(path).lastIndexOf('/') + 1)
const _path_relative = (first, second) => String(second).indexOf(String(first)) === 0 ? String(second).substring(String(first).length + 1) : ''

const _readdir = (path, options) => {
  const path_split = String(path).replace(/^\/|\/$/, '').split('/')
  let item = disk
  while (path_split.length) item = item[path_split.shift()]

  if (options.withFileTypes) {
    return Object.keys(item).map(name => ({
      name,
      isDirectory: jest.fn(() => item[name] !== null)
    }))
  }

  return Object.keys(item)
}

const _fs = {
  access: jest.fn((path, callback) => {
    if (path.match(/\/\.config\.json$/)) {
      callback(null)
    }

    if (path.match(/\/example\.file\.b\.md$/)) {
      callback(null)
    }

    if (path.match(/\/example\.directory\.b$/)) {
      callback(null)
    }

    callback(new Error('error!'))
  }),
  lstat: jest.fn((path, callback) => {
    const path_split = String(path).replace(/^\/|\/$/, '').split('/')
    let item = disk
    while (path_split.length) {
      const name = path_split.shift()

      if (!(name in item)) {
        callback(new Error('error!'))
      }

      item = item[name]
    }

    const directory = item !== null

    const result = {
      isDirectory: jest.fn(() => directory)
    }

    callback(null, result)
  }),
  readdir: jest.fn((path, options, callback) => (callback ?? options)(0, _readdir(path, options))),
  mkdir: jest.fn((path, options, callback) => (callback ?? options)(null)),
  copyFile: jest.fn((src, dest, mode, callback) => (callback ?? mode)(null)),
  readFile: jest.fn((path, encoding, callback) => {
    if (path.match(/\/\.config\.json$/)) {
      callback(null, '{ "map": { "example.file.a.md": "example.%Y.%m.%d.%H.%i.%s.md" } }')
    }

    callback(new Error('error!'))
  })
}

const _path = {
  sep: '/',
  join: jest.fn((...list) => list.join('/').replace(/^\/|\/$/g, '')),
  basename: jest.fn(_path_basename),
  relative: jest.fn(_path_relative)
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return _fs
    case 'path': return _path
  }
})

describe('store/modules/templates', () => {
  let localVue
  let store

  beforeEach(() => {
    disk = {
      'project': {
        '.tome': {
          'templates': {
            'example.template.a': {
              'example.file.a.md': null,
              'example.file.b.md': null,
              'example.file.c.md': null,
              'example.directory.a': {
                'example.file.b.md': null,
                'example.file.c.md': null
              },
              'example.directory.b': { },
              '.config.json': null
            },
            'example.template.b': null,
            'example.template.c': null
          }
        },
        'first': {
          'a.md': null,
          'b.md': null,
          'c.md': null
        },
        'second': {
          'b.md': null,
          'c.md': null
        },
        'third': {
          'c.md': null
        }
      }
    }

    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store(cloneDeep({
      modules: {
        templates
      }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.templates.path).toBeNull()
    expect(store.state.templates.base).toBeNull()
    expect(store.state.templates.options).toEqual([])
  })

  it('should set path and base then load template list when load is dispatched', async () => {
    const project = '/project'

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.templates.path).toEqual(project)
    expect(store.state.templates.base).toEqual(_path.join(project, '.tome/templates'))
    expect(store.state.templates.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain templates when load is dispatched', async () => {
    const project = '/project'

    /* eslint-disable dot-notation */
    delete disk['project']['.tome']['templates']
    /* eslint-enable dot-notation */

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.templates.path).toBeNull()
    expect(store.state.templates.base).toBeNull()
    expect(store.state.templates.options).toEqual([])
  })

  it('should fail gracefully if templates in path is a file when load is dispatched', async () => {
    const project = '/project'

    /* eslint-disable dot-notation */
    disk['project']['.tome']['templates'] = null
    /* eslint-enable dot-notation */

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.templates.path).toBeNull()
    expect(store.state.templates.base).toBeNull()
    expect(store.state.templates.options).toEqual([])
  })

  it('should execute templates against the target path when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()
    await expect(store.dispatch('templates/execute', { name: template, target })).resolves.toBeUndefined()
  })

  it('should fail gracefully when invalid template name is provided when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.z'
    const target = '/project/first'

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()
    await expect(store.dispatch('templates/execute', { name: template, target })).resolves.toBeUndefined()
  })
})
