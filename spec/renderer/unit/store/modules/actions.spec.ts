import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import actions, { State as ActionState } from '@/store/modules/actions'
import { cloneDeep } from 'lodash'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  actions: ActionState
}

describe('store/modules/actions', () => {
  let store

  let files
  let post

  const log = vi.fn()

  const disk = new Disk()
  set_disk(disk)

  beforeEach(() => {
    disk.reset_disk()

    post = undefined
    files = {
      namespaced: true,
      state: {
        active: undefined,
        content: undefined,
        error: undefined,
        tree: undefined,
        ghost: undefined,
        selected: undefined,
        editing: false,
        post: undefined,
        watcher: undefined,
      },
      actions: {
        create: vi.fn(),
        identify: vi.fn(() => ({})),
        ghost: vi.fn((context, criteria) => {
          post = criteria.post
        }),
        select: vi.fn(),
        save: vi.fn(),
      },
    }

    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: {
        actions,
        files,
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.actions.target).toEqual({ base: '', absolute: '', relative: '' })
    expect(store.state.actions.options).toEqual([])
  })

  it('should set path and base then load action list when load is dispatched', async () => {
    const project = '/project'

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeUndefined()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.target.absolute).toEqual('/project/.tome/actions')
    expect(store.state.actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeUndefined()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/actions')

    await store.dispatch('actions/load', { path: project })

    expect(store.state.actions.target).not.toBeUndefined()
    expect(store.state.actions.target.base).toEqual(project)
    expect(store.state.actions.options).toEqual([])
  })

  it('should execute actions against the target path when execute is dispatched', async () => {
    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target })

    expect(mocked_api.action.invoke).toHaveBeenCalledWith(`${project}/.tome/actions/${action}`, target, undefined)
  })

  it('should execute actions with specific input provided when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementationOnce(() => Promise.resolve({ success: true, message: 'specific message', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'
    const input = 'Example Input'

    await store.dispatch('actions/load', { path: project })
    await store.dispatch('actions/execute', { name: action, target, input })

    expect(mocked_api.action.invoke).toHaveBeenCalledWith(`${project}/.tome/actions/${action}`, target, input)
  })

  it('should provide error if executed action failed when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementation(() => Promise.resolve({ success: false, message: 'Error Message', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    const { error } = await store.dispatch('actions/execute', { name: action, target })

    expect(error).not.toBeUndefined()
  })

  it('should provide error with default message if executed action failed and no message provided when execute is dispatched', async () => {
    mocked_api.action.invoke.mockImplementation(() => Promise.resolve({ success: false, message: '', input: '' }))

    const project = '/project'
    const action = 'example.action.a'
    const target = '/project/first'

    await store.dispatch('actions/load', { path: project })
    const { error } = await store.dispatch('actions/execute', { name: action, target })

    expect(error).not.toBeUndefined()
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

    expect(post).toBeUndefined()
    expect(files.actions.ghost).toHaveBeenCalledTimes(0)

    await store.dispatch('actions/ghost')

    expect(post).not.toBeUndefined()
    expect(files.actions.ghost).toHaveBeenCalledTimes(1)

    await post(project)

    expect(files.actions.create).toHaveBeenCalledTimes(1)
    expect(files.actions.save).toHaveBeenCalledTimes(1)
    expect(files.actions.select).toHaveBeenCalledTimes(1)
  })
})
