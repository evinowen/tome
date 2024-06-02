import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import Commit from '@/objects/performances/Commit'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/Commit', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should exit Commit performance when "repository/committer/staged" returns false upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.staged = vi.fn(async () => false)

    await Commit.perform()

    expect(repository_committer.commit).not.toHaveBeenCalledWith()
  })

  it('should complete Commit performance when "repository/committer/staged" returns true upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.staged = vi.fn(async () => true)

    await Commit.perform()

    expect(repository_committer.commit).toHaveBeenCalledWith()
  })

  it('should not trigger QuickPush performance when "system/commit_push" returns false upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.staged = vi.fn(async () => true)

    const system = fetch_system_store()
    system.commit_push = false

    await Commit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })

  it('should trigger QuickPush performance when "system/commit_push" returns true upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.staged = vi.fn(async () => true)

    const system = fetch_system_store()
    system.commit_push = true

    await Commit.perform()

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })

  it('should not trigger QuickPush performance when "system/commit_push" returns true if commit fails upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.staged = vi.fn(async () => true)

    const system = fetch_system_store()
    system.commit_push = true

    repository_committer.commit = vi.fn(() => {
      throw new Error('Error')
    })

    await Commit.perform()

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.QuickPush)
  })
})
