import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import template from '@/store/plugins/mediations/template'

describe('store/plugins/mediations/template.js', () => {
  let localVue
  let store

  let templates
  let files

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    templates = {
      namespaced: true,
      state: {
        last: {
          path: '/example.file.a.md'
        }
      },
      mutations: {
        complete: jest.fn()
      },
      actions: {
        complete: (context) => {
          context.commit('complete')
        }
      }
    }

    files = {
      namespaced: true,
      actions: {
        load: jest.fn()
      }
    }

    store = new Vuex.Store({
      state: { },
      modules: {
        templates,
        files
      },
      plugins: [
        template
      ]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch files load action when templating completes', async () => {
    await store.dispatch('templates/complete')

    expect(files.actions.load).toHaveBeenCalledTimes(1)
  })
})
