import { remote } from 'electron'
import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'

jest.mock('electron', () => ({ remote: { app: jest.fn(), require: jest.fn() } }))

const path = {
  join: jest.fn((first, second) => String(first).replace(/\/$/g, '').concat('/').concat(String(second).replace(/^\/|\/$/g, '')))
}

remote.app = {
  getPath: jest.fn(() => './test_path')
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'path': return path
  }
})

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
})
