import { remote } from 'electron'
import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

jest.mock('@/store/modules/tome')
jest.mock('@/store/modules/configuration')
jest.mock('@/store/modules/library')
jest.mock('@/store/modules/files')
jest.mock('@/store/modules/templates')
jest.mock('@/store/modules/actions')
jest.mock('@/store/modules/configuration')
jest.mock('@/store/modules/clipboard')
jest.mock('@/store/modules/search')
jest.mock('@/store/plugins/mediator')

describe('src/store/index.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    jest.isolateModules(() => {
      store = require('@/store').default
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', () => {
    expect(store.state.application_path).toBe('')
    expect(store.state.configuration_path).toBe('')
    expect(store.state.library_path).toBe('')
  })

  it('should perform initial state setup on dispatch of hydrate action', async () => {
    await store.dispatch('hydrate')
  })

  it('should store message event on dispatch of error action', async () => {
    expect(store.state.events.length).toBe(0)

    await store.dispatch('message', 'Message!')

    expect(store.state.events.length).toBe(1)
  })

  it('should store error event on dispatch of error action', async () => {
    expect(store.state.events.length).toBe(0)

    await store.dispatch('error', 'Error!')

    expect(store.state.events.length).toBe(1)
  })
})
