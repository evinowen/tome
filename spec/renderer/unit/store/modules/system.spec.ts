import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import Commit from '@/objects/performances/Commit'
import QuickCommit from '@/objects/performances/QuickCommit'
import AutoCommit from '@/objects/performances/AutoCommit'
import Push from '@/objects/performances/Push'
import QuickPush from '@/objects/performances/QuickPush'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/repository', () => ({
  fetch_repository_store: vi.fn(() => ({
    ready: true,
  })),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/system', () => {
  let system

  const store_action_repository_signature_check = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    system = fetch_system_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load system metadata on load dispatch', async () => {
    await system.load()

    expect(mocked_api.app.getVersion).toHaveBeenCalled()
    expect(mocked_api.app.getProcess).toHaveBeenCalled()
    expect(mocked_api.window.is_maximized).toHaveBeenCalled()
  })

  it('should return current state for key on read dispatch', async () => {
    const result = await system.read('settings')

    expect(result).toBe(false)
  })

  it('should call for minimize and set maximize flag on minimize dispatch', async () => {
    await system.minimize()

    expect(mocked_api.window.minimize).toHaveBeenCalled()
    expect(system.maximized).toBe(false)
  })

  it('should call for restore and set maximize flag on minimize dispatch', async () => {
    await system.restore()

    expect(mocked_api.window.restore).toHaveBeenCalled()
    expect(system.maximized).toBe(false)
  })

  it('should call for maximize and set maximize flag on maximize dispatch', async () => {
    await system.maximize()

    expect(mocked_api.window.maximize).toHaveBeenCalled()
    expect(system.maximized).toBe(true)
  })

  it('should call to exit on exit dispatch', async () => {
    await system.exit()

    expect(mocked_api.window.close).toHaveBeenCalled()
  })

  const flags = [
    'branches',
    'branches_remove_confirm',
    'commit',
    'commit_push',
    'console',
    'edit',
    'history',
    'patch',
    'push',
    'push_confirm',
    'search',
    'settings',
    'tags',
    'tags_remove_confirm',
  ]

  for (const flag of flags) {
    it(`should set ${flag} flag on ${flag} dispatch with truthy value`, async () => {
      expect(system[flag]).toBe(false)
      await system.page({ [flag]: true })
      expect(system[flag]).toBe(true)
    })

    it(`should set ${flag} flag on ${flag} dispatch with falsey value`, async () => {
      expect(system[flag]).toBe(false)
      await system.page({ [flag]: true })
      expect(system[flag]).toBe(true)
      await system.page({ [flag]: false })
      expect(system[flag]).toBe(false)
    })
  }

  it('should set commit_confirm flag true on commit_confirm dispatch with truthy value when repository/committer/signature/check returns true', async () => {
    store_action_repository_signature_check.mockImplementation(() => true)

    expect(system.commit_confirm).toBe(false)
    await system.page({ commit_confirm: true })
    expect(system.commit_confirm).toBe(true)
  })

  it('should set commit_confirm flag to false on commit_confirm dispatch with falsey value', async () => {
    store_action_repository_signature_check.mockImplementation(() => true)

    expect(system.commit_confirm).toBe(false)
    await system.page({ commit_confirm: true })
    expect(system.commit_confirm).toBe(true)

    await system.page({ commit_confirm: false })
    expect(system.commit_confirm).toBe(false)
  })

  it('should call Commit performance on perform dispatch', async () => {
    const spy = vi.spyOn(Commit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await system.page({ commit_push: true })
    await system.perform(SystemPerformance.Commit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickCommit performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickCommit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await system.perform(SystemPerformance.QuickCommit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call AutoCommit performance on perform dispatch', async () => {
    const spy = vi.spyOn(AutoCommit, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await system.perform(SystemPerformance.AutoCommit)

    expect(spy).toHaveBeenCalled()
  })

  it('should call Push performance on perform dispatch', async () => {
    const spy = vi.spyOn(Push, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await system.perform(SystemPerformance.Push)

    expect(spy).toHaveBeenCalled()
  })

  it('should call QuickPush performance on perform dispatch', async () => {
    const spy = vi.spyOn(QuickPush, 'perform')

    expect(spy).not.toHaveBeenCalled()

    await system.perform(SystemPerformance.QuickPush)

    expect(spy).toHaveBeenCalled()
  })
})
