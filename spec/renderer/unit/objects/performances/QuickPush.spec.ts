import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import QuickPush from '@/objects/performances/QuickPush'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/QuickPush', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should trigger Push performance upon call to QuickPush.perform', async () => {
    const system = fetch_system_store()

    await QuickPush.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Push)
  })
})
