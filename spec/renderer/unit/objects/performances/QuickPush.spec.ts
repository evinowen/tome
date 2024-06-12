import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import QuickPush from '@/objects/performances/QuickPush'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
  pickBy: vi.fn(),
  merge: vi.fn(),
  set: vi.fn(),
}))

describe('objects/performances/QuickPush', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = SettingsStateDefaults()

    setActivePinia(pinia)
  })

  it('should not trigger Push performance if repositry_remotes.error is set upon call to QuickPush.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.error = 'remote-load-error'

    await QuickPush.perform()

    const system = fetch_system_store()
    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.Push)
  })

  it('should trigger Push performance upon call to QuickPush.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.error = ''

    await QuickPush.perform()

    const system = fetch_system_store()
    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Push)
  })

  it('should return false if triggered Push performance returns false upon call to QuickPush.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.error = ''

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Push:
          return false
      }

      return true
    })

    const result = await QuickPush.perform()

    expect(result).toEqual(false)
  })

  it('should return true if triggered Push performance returns true upon call to QuickPush.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.error = ''

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Push:
          return true
      }

      return true
    })

    const result = await QuickPush.perform()

    expect(result).toEqual(true)
  })
})
