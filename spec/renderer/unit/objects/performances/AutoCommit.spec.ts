import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
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

  it('should not trigger Commit performance when "repository_committer.check" returns false upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => false)

    const system = fetch_system_store()

    await AutoCommit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should trigger Commit performance when "repository_committer.check" returns true upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const system = fetch_system_store()

    await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should return false if error is thrown upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const system = fetch_system_store()
    system.perform = vi.fn(async () => {
      throw new Error('Error')
    })

    const result = await AutoCommit.perform()

    expect(result).toEqual(false)
  })

  it('should return false if triggered Commit performance returns false upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return false
      }

      return true
    })

    const result = await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
    expect(result).toEqual(false)
  })

  it('should return true if triggered Commit performance returns true upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true
      }

      return false
    })

    const result = await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
    expect(result).toEqual(true)
  })

  it('should return true if triggered Commit performance returns true upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true
      }

      return false
    })

    const result = await AutoCommit.perform()

    expect(result).toEqual(true)
  })

  it('should trigger AutoPush performance after succssful Commit performance when "configuration.active.auto_push" is true upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async () => true)

    await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.AutoPush)
  })

  it('should return false if triggered AutoPush performance returns false upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true

        case SystemPerformance.AutoPush:
          return false
      }

      return false
    })

    const result = await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.AutoPush)
    expect(result).toEqual(false)
  })

  it('should return true if triggered AutoPush performance returns true upon call to AutoCommit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.check = vi.fn(() => true)

    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true

        case SystemPerformance.AutoPush:
          return true
      }

      return false
    })

    const result = await AutoCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.AutoPush)
    expect(result).toEqual(true)
  })
})
