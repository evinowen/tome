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

  beforeEach(() => {
    window._.reset_disk()

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
    expect(store.state.actions.base).toEqual('/project/.tome/actions')
    expect(store.state.actions.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain actions when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

    await expect(store.dispatch('actions/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.actions.path).toBeNull()
    expect(store.state.actions.base).toBeNull()
    expect(store.state.actions.options).toEqual([])
  })

  it('should fail gracefully if actions in path is a file when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/actions')

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
