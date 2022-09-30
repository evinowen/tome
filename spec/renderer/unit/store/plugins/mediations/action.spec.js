import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import template from '@/store/plugins/mediations/action'

describe('store/plugins/mediations/action', () => {
  let localVue
  let store

  let actions
  let repository

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    actions = {
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
        path: null
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
      state: { },
      modules: {
        actions,
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

  it('should dispatch template load action when tome path changes', async () => {
    expect(actions.actions.load).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/path', '/project')

    expect(actions.actions.load).toHaveBeenCalledTimes(1)
  })
})
