import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import reporter from '@/store/plugins/reporter'

describe('store/plugins/reporter', () => {
  let localVue
  let store
  let object

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    const module = {
      namespaced: true,
      actions: {
        test: async function () {
          throw new Error('Error!')
        }
      }
    }

    object = {
      state: {
        files: {
          tree: undefined
        }
      },
      actions: {
        error: jest.fn()
      },
      modules: {
        module
      },
      plugins: [
        reporter
      ]
    }

    store = new Vuex.Store(object)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should catch errors and dispatch message to "error" action on exception', async () => {
    await store.dispatch('module/test')

    expect(object.actions.error).toHaveBeenCalledTimes(1)
  })
})
