import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import system from '@/store/plugins/mediations/system'

describe('store/plugins/mediations/system', () => {
  let store
  let store_dispatch

  let templates
  let repository_module
  let system_module

  let mock_commit_confirm
  let mock_commit
  let mock_edit
  let mock_push_confirm
  let mock_push
  let mock_search

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

    repository_module = {
      namespaced: true,
      state: {
        path: undefined,
      },
      mutations: {
        set: (state, data) => {
          Object.assign(state, data)
        },
      },
      actions: {
        set: (context, data) => {
          context.commit('set', data)
        },
      },
    }

    mock_commit_confirm = vi.fn()
    mock_commit = vi.fn()
    mock_edit = vi.fn()
    mock_push_confirm = vi.fn()
    mock_push = vi.fn()
    mock_search = vi.fn()

    system_module = {
      namespaced: true,
      state: {
        commit: undefined,
        push: undefined,
        edit: undefined,
      },
      mutations: {
        set: (state, data) => {
          Object.assign(state, data)
        },
      },
      actions: {
        set: (context, data) => {
          context.commit('set', data)
        },
        commit_confirm: vi.fn((context, data) => mock_commit_confirm(data)),
        commit: vi.fn((context, data) => mock_commit(data)),
        edit: vi.fn((context, data) => mock_edit(data)),
        push_confirm: vi.fn((context, data) => mock_push_confirm(data)),
        push: vi.fn((context, data) => mock_push(data)),
        search: vi.fn((context, data) => mock_search(data)),
      },
    }

    store = new Vuex.Store({
      state: {},
      modules: {
        repository: repository_module,
        system: system_module,
      },
      plugins: [
        system,
      ],
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch "system/commit_confirm" with false system.commit changes to false', async () => {
    await store.dispatch('system/set', { commit: false })

    expect(mock_commit_confirm).toHaveBeenCalledWith(false)
  })

  it('should dispatch "system/push_confirm" with false system.push changes to false', async () => {
    await store.dispatch('system/set', { push: false })

    expect(mock_push_confirm).toHaveBeenCalledWith(false)
  })

  it('should dispatch "system/commit" with false system.edit changes to false', async () => {
    await store.dispatch('system/set', { edit: false })

    expect(mock_commit).toHaveBeenCalledWith(false)
  })

  // Plugins do not await watch callbacks
  // it('should dispatch "system/push" with false system.edit changes to false', async () => {
  //   await store.dispatch('system/set', { edit: false })

  //   expect(mock_push).toHaveBeenCalledWith(false)
  // })

  it('should dispatch "system/edit" with false repository.path changes to a blank value', async () => {
    await store.dispatch('repository/set', { path: '' })

    expect(mock_edit).toHaveBeenCalledWith(false)
  })

  // Plugins do not await watch callbacks
  // it('should dispatch "system/commit" with false repository.path changes to a blank value', async () => {
  //   await store.dispatch('repository/set', { path: '' })

  //   expect(mock_commit).toHaveBeenCalledWith(false)
  // })

  // it('should dispatch "system/push" with false repository.path changes to a blank value', async () => {
  //   await store.dispatch('repository/set', { path: '' })

  //   expect(mock_push).toHaveBeenCalledWith(false)
  // })

  // it('should dispatch "system/search" with false repository.path changes to a blank value', async () => {
  //   await store.dispatch('repository/set', { path: '' })

  //   expect(mock_search).toHaveBeenCalledWith(false)
  // })
})
