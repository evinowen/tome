import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import template from '@/store/plugins/mediations/action'

describe('store/plugins/mediations/action', () => {
  let store

  let actions
  let repository

  beforeEach(() => {
    actions = {
      namespaced: true,
      mutations: {
        load: vi.fn()
      },
      actions: {
        load: vi.fn()
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
        actions,
        repository
      },
      plugins: [
        template
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch template load action when tome path changes', async () => {
    expect(actions.actions.load).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/path', '/project')

    expect(actions.actions.load).toHaveBeenCalledTimes(1)
  })
})
