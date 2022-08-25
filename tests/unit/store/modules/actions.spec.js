import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import actions from '@/store/modules/actions'
import { cloneDeep } from 'lodash'
import vm from 'vm'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

jest.mock('vm', () => ({
  createScript: jest.fn()
}))

const _script = {
  runInThisContext: jest.fn()
}

vm.createScript.mockImplementation(() => _script)

describe('store/modules/actions', () => {
  let localVue
  let store

  let files
  let post

  beforeEach(() => {
    window._.reset_disk()

    post = null
    files = {
      namespaced: true,
      state: {
        active: null,
        content: null,
        error: null,
        tree: null,
        ghost: null,
        selected: null,
        editing: false,
        post: null,
        watcher: null
      },
      actions: {
        create: jest.fn(),
        ghost: jest.fn((context, criteria) => {
          post = criteria.post
        }),
        select: jest.fn(),
        save: jest.fn()
      }
    }

    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store(cloneDeep({
      actions: {
        message: jest.fn()
      },
      modules: {
        actions,
        files
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

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.path).toEqual(project)
    expect(store.state.actions.base).toEqual('/project/.tome/actions')
    expect(store.state.actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should execute actions against the target path when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })
  })

  it('should fail gracefully when invalid action name is provided when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.z'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    expect(post).toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(0)

    await store.dispatch('actions/ghost')

    expect(post).not.toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(1)

    const project = '/project'
    await post(project)

    expect(files.actions.create).toHaveBeenCalledTimes(1)
    expect(files.actions.save).toHaveBeenCalledTimes(1)
    expect(files.actions.select).toHaveBeenCalledTimes(1)
  })
})
