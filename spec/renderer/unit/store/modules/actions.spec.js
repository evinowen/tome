import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import actions from '@/store/modules/actions'
import { cloneDeep } from 'lodash'
import vm from 'node:vm'

import builders from '?/builders'

Object.assign(window, builders.window())

jest.mock('node:vm', () => ({
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

  const message = jest.fn()
  const error = jest.fn()

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
        identify: jest.fn((context, criteria) => ({})),
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
      actions: { message, error },
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
    expect(store.state.actions.target).toEqual({ base: '', absolute: '', relative: '' })
    expect(store.state.actions.options).toEqual([])
  })

  it('should set path and base then load action list when load is dispatched', async () => {
    const project = '/project'

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeNull()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.target.absolute).toEqual('/project/.tome/actions')
    expect(store.state.actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeNull()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeNull()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.options).toEqual([])
  })

  it('should execute actions against the target path when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })

    expect(message).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(0)
  })

  it('should execute actions with specific message provided when execute is dispatched', async () => {
    window.api.action.invoke.mockImplementationOnce(() => ({ success: true, message: 'specific message' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })

    expect(message).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(0)
  })

  it('should provide error if executed action failed when execute is dispatched', async () => {
    window.api.action.invoke.mockImplementation(() => ({ success: false, message: 'Error Message' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })

    expect(message).toHaveBeenCalledTimes(0)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('should provide error with default message if executed action failed and no message provided when execute is dispatched', async () => {
    window.api.action.invoke.mockImplementation(() => ({ success: false }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })

    expect(message).toHaveBeenCalledTimes(0)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when invalid action name is provided when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.z'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    const project = '/project'

    await store.dispatch('actions/load', { path: project })

    expect(post).toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(0)

    await store.dispatch('actions/ghost')

    expect(post).not.toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(1)

    await post(project)

    expect(files.actions.create).toHaveBeenCalledTimes(1)
    expect(files.actions.save).toHaveBeenCalledTimes(1)
    expect(files.actions.select).toHaveBeenCalledTimes(1)
  })
})
