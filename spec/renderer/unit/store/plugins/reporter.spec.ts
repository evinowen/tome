import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import reporter from '@/store/plugins/reporter'

describe('store/plugins/reporter', () => {
  let store
  let object

  beforeEach(() => {
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
        error: vi.fn()
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
    vi.clearAllMocks()
  })

  it('should catch errors and dispatch message to "error" action on exception', async () => {
    await store.dispatch('module/test')

    expect(object.actions.error).toHaveBeenCalledTimes(1)
  })
})
