import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import templates from '@/store/modules/templates'
import { cloneDeep } from 'lodash'

import builders from '?/builders'

Object.assign(window, builders.window())

window._.set_content('{}')

describe('store/modules/templates', () => {
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
        load: jest.fn(),
        select: jest.fn(),
        save: jest.fn()
      }
    }

    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({
      actions: { message, error },
      modules: {
        files,
        templates
      }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.templates.target).toBeNull()
    expect(store.state.templates.options).toEqual([])
  })

  it('should set path and base then load template list when load is dispatched', async () => {
    const project = '/project'

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeNull()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.target.absolute).toEqual('/project/.tome/templates')
    expect(store.state.templates.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain templates when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/templates')

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeNull()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.options).toEqual([])
  })

  it('should fail gracefully if templates in path is a file when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/templates')

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeNull()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.options).toEqual([])
  })

  it('should execute templates against the target path when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(message).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(0)
  })

  it('should dispatch load and select if result is returned from template when execute is dispatched', async () => {
    window.api.template.invoke.mockImplementation(() => ({ success: true, result: '/path' }))

    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(message).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(0)
    expect(files.actions.load).toHaveBeenCalledTimes(1)
    expect(files.actions.select).toHaveBeenCalledTimes(1)
  })

  it('should provide error if executed template failed when execute is dispatched', async () => {
    window.api.template.invoke.mockImplementation(() => ({ success: false, message: 'Error Message' }))

    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(message).toHaveBeenCalledTimes(0)
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when invalid template name is provided when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.z'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    const project = '/project'

    await store.dispatch('templates/load', { path: project })

    expect(post).toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(0)

    await store.dispatch('templates/ghost')

    expect(post).not.toBeNull()
    expect(files.actions.ghost).toHaveBeenCalledTimes(1)
    await post(project)

    expect(files.actions.create).toHaveBeenCalledTimes(2)
    expect(files.actions.save).toHaveBeenCalledTimes(2)
    expect(files.actions.select).toHaveBeenCalledTimes(2)
  })
})
