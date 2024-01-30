import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import template from '@/store/plugins/mediations/template'

describe('store/plugins/mediations/template', () => {
  let store

  let templates
  let repository

  beforeEach(() => {
    templates = {
      namespaced: true,
      mutations: {
        load: vi.fn(),
      },
      actions: {
        load: vi.fn(),
      },
    }

    repository = {
      namespaced: true,
      state: {
        path: undefined,
      },
      mutations: {
        path: (state, path) => {
          state.path = path
        },
      },
      actions: {
        path: (context, path) => {
          context.commit('path', path)
        },
      },
    }

    store = new Vuex.Store({
      state: {},
      modules: {
        templates,
        repository,
      },
      plugins: [
        template,
      ],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch template load action when repository path changes', async () => {
    expect(templates.actions.load).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/path', '/project')

    expect(templates.actions.load).toHaveBeenCalledTimes(1)
  })
})
