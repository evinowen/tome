import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import metadata from '@/store/plugins/mediations/metadata'

describe('store/plugins/mediations/metadata', () => {
  let localVue
  let store
  let object

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    const repository = {
      namespaced: true,
      actions: {
        metadata: jest.fn()
      }
    }

    object = {
      state: {
        files: {
          tree: undefined
        }
      },
      modules: {
        repository
      },
      plugins: [
        metadata
      ]
    }

    store = new Vuex.Store(object)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch files load action when templating completes', async () => {
    store.state.files.tree = {
      timestamp: 100,
      base: {
        children: [
          { name: 'readme.md', path: 'readme.md' },
          { name: 'license.md', path: 'license.md' },
          { name: 'authors.md', path: 'authors.md' },
          { name: 'contributors.md', path: 'contributors.md' }
        ]
      }
    }

    await localVue.nextTick()
    await localVue.nextTick()
    await localVue.nextTick()
    await localVue.nextTick()

    expect(object.modules.repository.actions.metadata).toHaveBeenCalledTimes(4)
  })
})
