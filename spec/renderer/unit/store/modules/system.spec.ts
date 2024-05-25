import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import system, { State as SystemState, SystemPerformance } from '@/store/modules/system'
import Commit from '@/objects/performances/Commit'
import QuickCommit from '@/objects/performances/QuickCommit'
import AutoCommit from '@/objects/performances/AutoCommit'
import Push from '@/objects/performances/Push'
import QuickPush from '@/objects/performances/QuickPush'
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
  const store_action_repository_signature_check = vi.fn()

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
            inspect: vi.fn(),
            push: vi.fn(),
            loaded: vi.fn(() => true),
            stage: vi.fn(),
            staged: vi.fn(),
          },
          modules: {
            committer: {
              namespaced: true,
              actions: {
                inspect: vi.fn(),
                stage: vi.fn(),
                staged: vi.fn(),
              },
              modules: {
                signature: {
                  namespaced: true,
                  actions: {
                    name: vi.fn(),
                    email: vi.fn(),
                    message: vi.fn(),
                    uncheck: vi.fn(),
                    check: store_action_repository_signature_check,
                  },
                },
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
    it(`should set ${flag} flag on ${flag} dispatch with defined value`, async () => {
      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
    })

    it(`should not set ${flag} flag on ${flag} dispatch with undefined value`, async () => {
      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
      await store.dispatch(`system/${flag}`)
      expect(store.state.system[flag]).toBe(true)
    })
  }

  it('should not set commit_confirm flag true on commit_confirm dispatch with truthy value when repository/committer/signature/check returns false', async () => {
    store_action_repository_signature_check.mockImplementation(() => false)

    expect(store.state.system.commit_confirm).toBe(false)
    await store.dispatch('system/commit_confirm', true)
    expect(store.state.system.commit_confirm).toBe(false)
  })

  it('should set commit_confirm flag true on commit_confirm dispatch with truthy value when repository/committer/signature/check returns true', async () => {
    store_action_repository_signature_check.mockImplementation(() => true)

    expect(store.state.system.commit_confirm).toBe(false)
    await store.dispatch('system/commit_confirm', true)
    expect(store.state.system.commit_confirm).toBe(true)
  })

  it('should set commit_confirm flag to false on commit_confirm dispatch with falsey value', async () => {
    store_action_repository_signature_check.mockImplementation(() => true)

    expect(store.state.system.commit_confirm).toBe(false)
    await store.dispatch('system/commit_confirm', true)
    expect(store.state.system.commit_confirm).toBe(true)

    await store.dispatch('system/commit_confirm', false)
    expect(store.state.system.commit_confirm).toBe(false)
  })

  it('should not set commit_confirm flag on commit_confirm dispatch with undefined value', async () => {
    store_action_repository_signature_check.mockImplementation(() => true)

    expect(store.state.system.commit_confirm).toBe(false)
    await store.dispatch('system/commit_confirm', true)
    expect(store.state.system.commit_confirm).toBe(true)
    await store.dispatch('system/commit_confirm')
    expect(store.state.system.commit_confirm).toBe(true)
  })

  it('should call Commit performance on perform dispatch', async () => {
    const spy = vi.spyOn(Commit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/commit_push', true)
    await store.dispatch('system/perform', SystemPerformance.Commit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickCommit performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickCommit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', SystemPerformance.QuickCommit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call AutoCommit performance on perform dispatch', async () => {
    const spy = vi.spyOn(AutoCommit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', SystemPerformance.AutoCommit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call Push performance on perform dispatch', async () => {
    const spy = vi.spyOn(Push, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', SystemPerformance.Push)

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickPush performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickPush, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', SystemPerformance.QuickPush)

    expect(spy).toHaveBeenCalled()
  })
})
