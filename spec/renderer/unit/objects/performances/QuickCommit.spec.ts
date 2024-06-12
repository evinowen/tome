import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import QuickCommit from '@/objects/performances/QuickCommit'

/* lodash */
vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

/* CommitError */
import CommitError from '@/objects/errors/CommitError'
vi.mock('@/objects/errors/CommitError', () => ({
  default: vi.fn(async () => false),
}))

describe('objects/performances/QuickCommit', () => {
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

  it('should not trigger Commit performance when "repository_committer.check" returns true upon call to QuickCommit.perform', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => true)

    const system = fetch_system_store()

    await QuickCommit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should trigger Commit performance when "repository_committer.check" returns false upon call to QuickCommit.perform', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    const system = fetch_system_store()

    await QuickCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should return true if performance completes successfully upon call to QuickCommit.perform', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    const system = fetch_system_store()
    system.perform = vi.fn(async () => true)

    const result = await QuickCommit.perform()

    expect(result).toEqual(true)
  })

  it('should return false if error is thrown upon call to QuickCommit.perform', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    const system = fetch_system_store()
    system.perform = vi.fn(async () => {
      throw new Error('Error')
    })

    const result = await QuickCommit.perform()

    expect(result).toEqual(false)
  })

  it('should not trigger QuickPush performance when trigger configuration.active.auto_push is false upon call to QuickCommit.perform', async () => {
    const configuration = fetch_configuration_store()
    configuration.active.auto_push = false

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true
      }

      return true
    })

    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    await QuickCommit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })

  it('should not trigger QuickPush performance when trigger Commit performance returns false upon call to QuickCommit.perform', async () => {
    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return false
      }

      return true
    })

    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    await QuickCommit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })

  it('should trigger QuickPush performance when trigger Commit performance returns true and configuration.active.auto_push is true upon call to QuickCommit.perform', async () => {
    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true
      }

      return true
    })

    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    await QuickCommit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })

  it('should return false when triggered QuickPush performance returns false upon call to QuickCommit.perform', async () => {
    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true

        case SystemPerformance.QuickPush:
          return false
      }

      return true
    })

    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    const result = await QuickCommit.perform()

    expect(result).toEqual(false)
  })

  it('should return true when triggered QuickPush performance returns true upon call to QuickCommit.perform', async () => {
    const configuration = fetch_configuration_store()
    configuration.active.auto_push = true

    const system = fetch_system_store()
    system.perform = vi.fn(async (performance) => {
      switch (performance) {
        case SystemPerformance.Commit:
          return true

        case SystemPerformance.QuickPush:
          return true
      }

      return true
    })

    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => false)

    const result = await QuickCommit.perform()

    expect(result).toEqual(true)
  })
})
