import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'
import AutoCommit from '@/objects/performances/AutoCommit'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
  pickBy: vi.fn(),
  merge: vi.fn(),
}))

describe('objects/performances/AutoCommit', () => {
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

  it('should not trigger Commit performance when "repository_committer_signature.check" returns false upon call to AutoCommit.perform', async () => {
    const system = fetch_system_store()
    const repository_committer_signature = fetch_repository_committer_signature_store()
    repository_committer_signature.check = vi.fn(() => false)

    await AutoCommit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should trigger Commit performance when "repository_committer_signature.check" returns true upon call to AutoCommit.perform', async () => {
    const system = fetch_system_store()
    const repository_committer_signature = fetch_repository_committer_signature_store()
    repository_committer_signature.check = vi.fn(() => true)

    await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
  })
})
