import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import document from '@/store/plugins/mediations/document'
import { cloneDeep } from 'lodash'

describe('store/plugins/mediations/document.js', () => {
  let localVue
  let store
  let actions

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    actions = {
      index: jest.fn()
    }

    const search = {
      namespaced: true,
      actions
    }

    store = new Vuex.Store({
      state: {
        files: {
          tree: null
        }
      },
      modules: {
        search
      },
      plugins: [
        document
      ]
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch actions with data when tree timestamp changes', async () => {
    store.state.files.tree = { timestamp: 100 }

    await localVue.nextTick()

    expect(actions.index).toHaveBeenCalledTimes(1)
  })
})
