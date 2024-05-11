import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import reporter from '@/store/plugins/reporter'

describe('store/plugins/reporter', () => {
  let store
  let object

  let error: Error

  beforeEach(() => {
    error = new Error('Error Message')
    error.stack = 'Error: Example Stack Message\n\tat Example (example/example.js:0:0)'

    const module = {
      namespaced: true,
      actions: {
        test: async function () {
          throw error
        },
      },
    }

    object = {
      state: {
        files: {
          tree: undefined,
        },
      },
      actions: {
        log: vi.fn(),
      },
      modules: {
        module,
      },
      plugins: [
        reporter,
      ],
    }

    store = new Vuex.Store(object)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should catch errors and dispatch log as "error" level on exception', async () => {
    await store.dispatch('module/test')

    expect(object.actions.log).toHaveBeenCalledTimes(1)
  })
})
