import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
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

  it('should trigger Push performance upon call to QuickPush.perform', async () => {
    const system = fetch_system_store()

    await QuickPush.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Push)
  })
})
