import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import reporter from '@/store/plugins/reporter'

describe('store/plugins/reporter.js', () => {
  let localVue
  let store
  let object

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    const search = {
      namespaced: true,
      actions: {
        index: async function () {
          throw new Error('Error!')
        }
      }
    }

    object = {
      state: {
        files: {
          tree: null
        }
      },
      actions: {
        error: jest.fn()
      },
      modules: {
        search
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
    await store.dispatch('fail')

    expect(object.actions.error).toHaveBeenCalledTimes(1)
  })
})
