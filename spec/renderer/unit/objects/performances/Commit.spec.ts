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

  it('should exit Commit performance when "repository_committer.status.staged" is empty upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.status.staged.length = 0

    await Commit.perform()

    expect(repository_committer.commit).not.toHaveBeenCalledWith()
  })

  it('should complete Commit performance when"repository_committer.status.staged" has at least one item upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.status.staged.push({ path: '/example', type: 1 })

    await Commit.perform()

    expect(repository_committer.commit).toHaveBeenCalledWith()
  })

  it('should return false if repository_committer.commit throws error upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.status.staged.push({ path: '/example', type: 1 })
    repository_committer.commit = vi.fn(async () => {
      throw new Error('Error')
    })

    const result = await Commit.perform()

    expect(repository_committer.commit).toHaveBeenCalledWith()
    expect(result).toEqual(false)
  })

  it('should return true if repository_committer.commit exits without throwing error upon call to Commit.perform', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.status.staged.push({ path: '/example', type: 1 })
    repository_committer.commit = vi.fn()

    const result = await Commit.perform()

    expect(repository_committer.commit).toHaveBeenCalledWith()
    expect(result).toEqual(true)
  })
})
