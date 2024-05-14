import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import templates, { State as TemplateState } from '@/store/modules/templates'
import { cloneDeep } from 'lodash'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  templates: TemplateState
}

describe('store/modules/templates', () => {
  let store

  let files
  let post

  const disk = new Disk()
  set_disk(disk)

  const log = vi.fn()

  beforeEach(() => {
    disk.reset_disk()
    disk.set_content_default('{}')

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
        load: vi.fn(),
        select: vi.fn(),
        save: vi.fn(),
      },
    }

    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: {
        files,
        templates,
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.templates.target).toEqual({ base: '', absolute: '', relative: '' })
    expect(store.state.templates.options).toEqual([])
  })

  it('should set path and base then load template list when load is dispatched', async () => {
    const project = '/project'

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeUndefined()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.target.absolute).toEqual('/project/.tome/templates')
    expect(store.state.templates.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain templates when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/templates')

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeUndefined()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.options).toEqual([])
  })

  it('should fail gracefully if templates in path is a file when load is dispatched', async () => {
    const project = '/project'

    disk.unset_disk('/project/.tome/templates')

    await store.dispatch('templates/load', { path: project })

    expect(store.state.templates.target).not.toBeUndefined()
    expect(store.state.templates.target.base).toEqual(project)
    expect(store.state.templates.options).toEqual([])
  })

  it('should execute templates against the target path when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(mocked_api.template.invoke).toHaveBeenCalledWith(`${project}/.tome/templates/${template}`, target)
  })

  it('should dispatch load and select if result is returned from template when execute is dispatched', async () => {
    mocked_api.template.invoke.mockImplementation(() => Promise.resolve({ success: true, result: '/path' }))

    const project = '/project'
    const template = 'example.template.a'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(files.actions.load).toHaveBeenCalledTimes(1)
    expect(files.actions.select).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when invalid template name is provided when execute is dispatched', async () => {
    const project = '/project'
    const template = 'example.template.z'
    const target = '/project/first'

    await store.dispatch('templates/load', { path: project })
    await store.dispatch('templates/execute', { name: template, target })

    expect(mocked_api.template.invoke).not.toHaveBeenCalled()
  })

  it('should trigger a file ghost and post processing when ghost is dispatched', async () => {
    const project = '/project'

    await store.dispatch('templates/load', { path: project })

    expect(post).toBeUndefined()
    expect(files.actions.ghost).toHaveBeenCalledTimes(0)

    await store.dispatch('templates/ghost')

    expect(post).not.toBeUndefined()
    expect(files.actions.ghost).toHaveBeenCalledTimes(1)
    await post(project)

    expect(files.actions.create).toHaveBeenCalledTimes(2)
    expect(files.actions.save).toHaveBeenCalledTimes(2)
    expect(files.actions.select).toHaveBeenCalledTimes(2)
  })
})
