import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import template from '@/store/plugins/mediations/template'

describe('store/plugins/mediations/template', () => {
  let localVue
  let store

  let templates
  let repository

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    templates = {
      namespaced: true,
      mutations: {
        load: jest.fn()
      },
      actions: {
        load: jest.fn()
      }
    }

    repository = {
      namespaced: true,
      state: {
        path: undefined
      },
      mutations: {
        path: (state, path) => {
          state.path = path
        }
      },
      actions: {
        path: (context, path) => {
          context.commit('path', path)
        }
      }
    }

    store = new Vuex.Store({
      state: {},
      modules: {
        templates,
        repository
      },
      plugins: [
        template
      ]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch template load action when repository path changes', async () => {
    expect(templates.actions.load).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/path', '/project')

    expect(templates.actions.load).toHaveBeenCalledTimes(1)
  })
})
