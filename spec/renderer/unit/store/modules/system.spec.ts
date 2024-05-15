import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import system, { State as SystemState } from '@/store/modules/system'
import Commit from '@/store/modules/system/commit'
import QuickCommit from '@/store/modules/system/quick_commit'
import Push from '@/store/modules/system/push'
import QuickPush from '@/store/modules/system/quick_push'
import * as api_module from '@/api'
import builders from '?/builders'
import { scafold as store_scafold } from '?/builders/store'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  system: SystemState
}

describe('store/modules/system', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store<State>(store_scafold({
      modules: {
        system,
        configuration: {
          namespaced: true,
          actions: {
            read: vi.fn(),
          },
        },
        files: {
          namespaced: true,
          actions: {
            debounce_flush: vi.fn(),
            reselect: vi.fn(),
          },
        },
        repository: {
          namespaced: true,
          actions: {
            commit: vi.fn(),
            push: vi.fn(),
            loaded: vi.fn(() => true),
            stage: vi.fn(),
          },
          modules: {
            signature: {
              namespaced: true,
              actions: {
                message: vi.fn(),
              },
            },
          },
        },
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load system metadata on load dispatch', async () => {
    await store.dispatch('system/load')

    expect(mocked_api.app.getVersion).toHaveBeenCalled()
    expect(mocked_api.app.getProcess).toHaveBeenCalled()
    expect(mocked_api.window.is_maximized).toHaveBeenCalled()
  })

  it('should return current state for key on read dispatch', async () => {
    const result = await store.dispatch('system/read', 'settings')

    expect(result).toBe(false)
  })

  it('should call for minimize and set maximize flag on minimize dispatch', async () => {
    await store.dispatch('system/minimize')

    expect(mocked_api.window.minimize).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(false)
  })

  it('should call for restore and set maximize flag on minimize dispatch', async () => {
    await store.dispatch('system/restore')

    expect(mocked_api.window.restore).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(false)
  })

  it('should call for maximize and set maximize flag on maximize dispatch', async () => {
    await store.dispatch('system/maximize')

    expect(mocked_api.window.maximize).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(true)
  })

  it('should call to exit on exit dispatch', async () => {
    await store.dispatch('system/exit')

    expect(mocked_api.window.close).toHaveBeenCalled()
  })

  const flags = [
    'branch',
    'commit',
    'commit_confirm',
    'commit_push',
    'console',
    'edit',
    'patch',
    'push',
    'push_confirm',
    'search',
    'settings',
  ]

  for (const flag of flags) {
    it(`should set ${flag} flag on ${flag} dispatch with non-undefined value`, async () => {
      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
    })

    it(`should not set ${flag} flag on ${flag} dispatch with no value`, async () => {
      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
      await store.dispatch(`system/${flag}`)
      expect(store.state.system[flag]).toBe(true)
    })
  }

  // const signature = [
  //   'name',
  //   'email',
  //   'message'
  // ]

  // for (const item of signature) {
  //   it(`should set ${item} flag on ${item} signature dispatch with non-undefined value`, async () => {
  //     expect(store.state.system.signature[item]).toBe(undefined)
  //     await store.dispatch(`system/signature/${item}`, item)
  //     expect(store.state.system.signature[item]).toBe(item)
  //   })
  // }

  // const credentials = [
  //   'key',
  //   'passphrase'
  // ]

  // for (const item of credentials) {
  //   it(`should set ${item} flag on ${item} credentials dispatch with non-undefined value`, async () => {
  //     expect(store.state.system.credentials[item]).toBe(undefined)
  //     await store.dispatch(`system/credentials/${item}`, item)
  //     expect(store.state.system.credentials[item]).toBe(item)
  //   })
  // }

  it('should call Commit performance on perform dispatch', async () => {
    const spy = vi.spyOn(Commit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/commit_push', true)
    await store.dispatch('system/perform', 'commit')

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickCommit performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickCommit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'quick-commit')

    expect(spy).toHaveBeenCalled()
  })

  it('should call Push performance on perform dispatch', async () => {
    const spy = vi.spyOn(Push, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'push')

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickPush performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickPush, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'quick-push')

    expect(spy).toHaveBeenCalled()
  })
})
