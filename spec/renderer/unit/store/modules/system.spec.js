import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import _system from '@/store/modules/system'
import { cloneDeep } from 'lodash'
import builders from '?/builders'
import Commit from '@/store/modules/system/commit'
import QuickCommit from '@/store/modules/system/quick_commit'
import Push from '@/store/modules/system/push'
import QuickPush from '@/store/modules/system/quick_push'

Object.assign(window, builders.window())

describe('store/modules/system', () => {
  let localVue
  let system
  let configuration

  const factory = {
    wrap: () => new Vuex.Store({
      modules: {
        system,
        configuration
      }
    })
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    system = cloneDeep(_system)

    configuration = {
      namespaced: true,
      actions: {
        read: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should load system metadata on load dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('system/load')

    expect(window.api.app.getVersion).toHaveBeenCalled()
    expect(window.api.app.getProcess).toHaveBeenCalled()
    expect(window.api.window.is_maximized).toHaveBeenCalled()
  })

  it('should return current state for key on read dispatch', async () => {
    const store = factory.wrap()

    const result = await store.dispatch('system/read', 'settings')

    expect(result).toBe(false)
  })

  it('should call for minimize and set maximize flag on minimize dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('system/minimize')

    expect(window.api.window.minimize).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(false)
  })

  it('should call for restore and set maximize flag on minimize dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('system/restore')

    expect(window.api.window.restore).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(false)
  })

  it('should call for maximize and set maximize flag on maximize dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('system/maximize')

    expect(window.api.window.maximize).toHaveBeenCalled()
    expect(store.state.system.maximized).toBe(true)
  })

  it('should call to exit on exit dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('system/exit')

    expect(window.api.window.close).toHaveBeenCalled()
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
    'settings'
  ]

  for (const flag of flags) {
    it(`should set ${flag} flag on ${flag} dispatch with non-null value`, async () => {
      const store = factory.wrap()

      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
    })

    it(`should not set ${flag} flag on ${flag} dispatch with no value`, async () => {
      const store = factory.wrap()

      expect(store.state.system[flag]).toBe(false)
      await store.dispatch(`system/${flag}`, true)
      expect(store.state.system[flag]).toBe(true)
      await store.dispatch(`system/${flag}`)
      expect(store.state.system[flag]).toBe(true)
    })
  }

  const signature = [
    'name',
    'email',
    'message'
  ]

  for (const item of signature) {
    it(`should set ${item} flag on ${item} signature dispatch with non-null value`, async () => {
      const store = factory.wrap()

      expect(store.state.system.signature[item]).toBe(null)
      await store.dispatch(`system/signature/${item}`, item)
      expect(store.state.system.signature[item]).toBe(item)
    })
  }

  const credentials = [
    'key',
    'passphrase'
  ]

  for (const item of credentials) {
    it(`should set ${item} flag on ${item} credentials dispatch with non-null value`, async () => {
      const store = factory.wrap()

      expect(store.state.system.credentials[item]).toBe(null)
      await store.dispatch(`system/credentials/${item}`, item)
      expect(store.state.system.credentials[item]).toBe(item)
    })
  }

  it('should call Commit performance on perform dispatch', async () => {
    const spy = jest.spyOn(Commit, 'perform')

    const store = factory.wrap()

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/commit_push', true)
    await store.dispatch('system/perform', 'commit')

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickCommit performance on perform dispatch', async () => {
    const spy = jest.spyOn(QuickCommit, 'perform')

    const store = factory.wrap()

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'quick-commit')

    expect(spy).toHaveBeenCalled()
  })

  it('should call Push performance on perform dispatch', async () => {
    const spy = jest.spyOn(Push, 'perform')

    const store = factory.wrap()

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'push')

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickPush performance on perform dispatch', async () => {
    const spy = jest.spyOn(QuickPush, 'perform')

    const store = factory.wrap()

    expect(spy).not.toHaveBeenCalled()

    await store.dispatch('system/perform', 'quick-push')

    expect(spy).toHaveBeenCalled()
  })
})
