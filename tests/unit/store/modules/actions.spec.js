import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import actions from '@/store/modules/actions'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

let disk

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
  readFile: jest.fn((path, encoding, callback) => {
    if (path.match(/\/index\.js$/)) {
      callback(null, 'const example = 1')
    }

    callback(new Error('error!'))
  })
}

const _path = {
  sep: '/',
  join: jest.fn((...list) => list.join('/').replace(/^\/|\/$/g, ''))
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return _fs
    case 'path': return _path
  }
})

describe('store/modules/actions', () => {
  let localVue
  let store

  beforeEach(() => {
    disk = {
      'project': {
        '.tome': {
          'actions': {
            'example.action.a': { 'index.js': null },
            'example.action.b': { 'index.js': null },
            'example.action.c': { 'index.js': null }
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
        actions
      }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should set path and base then load action list when load is dispatched', async () => {
    const project = '/project'

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.actions.path).toEqual(project)
    expect(store.state.actions.base).toEqual(_path.join(project, '.tome/actions'))
    expect(store.state.actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    /* eslint-disable dot-notation */
    delete disk['project']['.tome']['actions']
    /* eslint-enable dot-notation */

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    /* eslint-disable dot-notation */
    disk['project']['.tome']['actions'] = null
    /* eslint-enable dot-notation */

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should execute actions against the target path when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()
    await expect(store.dispatch('actions/execute', { name: action, target })).resolves.toBeUndefined()
  })

  it('should fail gracefully when invalid action name is provided when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.z'
    const target = '/project/first'

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()
    await expect(store.dispatch('actions/execute', { name: action, target })).resolves.toBeUndefined()
  })
})
