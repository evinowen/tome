import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import templates from '@/store/modules/templates'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

window._.set_content('{}')

describe('store/modules/templates', () => {
  let localVue
  let store

  beforeEach(() => {
    window._.reset_disk()

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
    expect(store.state.templates.base).toEqual('/project/.tome/templates')
    expect(store.state.templates.options.length).toBeGreaterThan(0)
  })

  it('should fail gracefully if path does not contain templates when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/templates')

    await expect(store.dispatch('templates/load', { path: project })).resolves.toBeUndefined()

    expect(store.state.templates.path).toBeNull()
    expect(store.state.templates.base).toBeNull()
    expect(store.state.templates.options).toEqual([])
  })

  it('should fail gracefully if templates in path is a file when load is dispatched', async () => {
    const project = '/project'

    window._.unset_disk('/project/.tome/templates')

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
