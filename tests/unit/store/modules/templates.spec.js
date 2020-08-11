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

const _lstat_result = (path) => ({
  isDirectory: jest.fn(() => {
    const path_split = String(path).replace(/^\/|\/$/, '').split('/')
    let item = disk
    while (path_split.length) item = item[path_split.shift()]

    return item !== null
  })
})

const _readdir = (path, options) => {
  const path_split = String(path).replace(/^\/|\/$/, '').split('/')
  let item = disk
  while (path_split.length) item = item[path_split.shift()]

  if (options.withFileTypes) {
    return Object.keys(item).map(name => ({
      name,
      isDirectory: jest.fn(() => item[name])
    }))
  }

  return Object.keys(item)
}

const _fs = {
  access: jest.fn((path, callback) => {
    if (path.match(/\/\.config\.json$/)) {
      callback(0)
    }

    if (path.match(/\/example\.file\.b\.md$/)) {
      callback(0)
    }

    if (path.match(/\/example\.directory\.b$/)) {
      callback(0)
    }


    callback(new Error('error!'))
  }),
  lstat: jest.fn((path, callback) => callback(null, _lstat_result(path))),
  readdir: jest.fn((path, options, callback) => (callback ?? options)(0, _readdir(path, options))),
  mkdir: jest.fn((path, options, callback) => (callback ?? options)(null)),
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
                'example.file.c.md': null,
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

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.path).toEqual(project)
    expect(store.state.templates.base).toEqual(_path.join(project, '.tome/templates'))
    expect(store.state.templates.options.length).toBeGreaterThan(0)
  })

  it('should execute templates against the target path when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })
  })
})
