import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import Push from '@/objects/performances/Push'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/Push', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should not complete Push performance upon call to Push.perform when repository_remotes.active.pending is empty', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.active.pending = []

    await Push.perform()

    expect(repository_remotes.push).not.toHaveBeenCalledWith()
  })

  it('should complete Push performance upon call to Push.perform when repository_remotes.active.pending is not empty', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.active.pending = [ {
      oid: '1234',
      date: new Date(),
      message: 'commit-message',
    } ]

    await Push.perform()

    expect(repository_remotes.push).toHaveBeenCalledWith()
  })

  it('should return false if repository_remotes.push throws error upon call to Push.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.active.pending = [ {
      oid: '1234',
      date: new Date(),
      message: 'commit-message',
    } ]
    repository_remotes.push = vi.fn(async () => {
      throw new Error('Error')
    })

    const result = await Push.perform()

    expect(repository_remotes.push).toHaveBeenCalledWith()
    expect(result).toEqual(false)
  })

  it('should return true if repository_remotes.push exits without throwing error upon call to Push.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()
    repository_remotes.active.pending = [ {
      oid: '1234',
      date: new Date(),
      message: 'commit-message',
    } ]
    repository_remotes.push = vi.fn()

    const result = await Push.perform()

    expect(repository_remotes.push).toHaveBeenCalledWith()
    expect(result).toEqual(true)
  })
})
