import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import metadata from '@/store/plugins/mediations/metadata'

describe('store/plugins/mediations/metadata', () => {
  let store
  let object

  beforeEach(() => {
    const repository = {
      namespaced: true,
      mutations: {
        metadata: vi.fn(),
      },
    }

    object = {
      state: {
        files: {},
      },
      mutations: {
        assign: function (state, data) {
          Object.assign(state.files, data)
        },
      },
      actions: {
        assign: function (context, data) {
          context.commit('assign', data)
        },
      },
      modules: {
        repository,
      },
      plugins: [
        metadata,
      ],
    }

    store = new Vuex.Store(object)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch files load action when templating completes', async () => {
    await store.dispatch('assign', {
      tree: {
        timestamp: 100,
        base: {
          children: [
            { name: 'readme.md', path: 'readme.md' },
            { name: 'license.md', path: 'license.md' },
            { name: 'authors.md', path: 'authors.md' },
            { name: 'contributors.md', path: 'contributors.md' },
          ],
        },
      },
    })

    expect(object.modules.repository.mutations.metadata).toHaveBeenCalledTimes(4)
  })
})
