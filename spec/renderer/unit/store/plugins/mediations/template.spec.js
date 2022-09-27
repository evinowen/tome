import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import template from '@/store/plugins/mediations/template'

describe('store/plugins/mediations/template.js', () => {
  let localVue
  let store

  let templates
  let tome

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

    tome = {
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
        templates,
        tome
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
    expect(templates.actions.load).toHaveBeenCalledTimes(0)

    await store.dispatch('tome/path', '/project')

    expect(templates.actions.load).toHaveBeenCalledTimes(1)
  })
})
