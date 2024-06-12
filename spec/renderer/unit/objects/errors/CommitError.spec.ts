import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitError from '@/objects/errors/CommitError'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/errors/CommitError', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should call "repository_committer.check" when CommitError is executed', async () => {
    const repository_committer = fetch_repository_committer_store()

    await CommitError()

    expect(repository_committer.check).toHaveBeenCalledWith()
  })

  it('should return false if no errors are flagged when CommitError is executed', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.error.name = false
    repository_committer.error.email = false
    repository_committer.error.message = false

    expect(await CommitError()).toEqual(false)
  })

  it('should return true if repository_committer.error.name is flagged when CommitError is executed', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.error.name = true
    repository_committer.error.email = false
    repository_committer.error.message = false

    expect(await CommitError()).toEqual(true)
  })

  it('should return true if repository_committer.error.email is flagged when CommitError is executed', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.error.name = false
    repository_committer.error.email = true
    repository_committer.error.message = false

    expect(await CommitError()).toEqual(true)
  })

  it('should return true if repository_committer.error.message is flagged when CommitError is executed', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.error.name = false
    repository_committer.error.email = false
    repository_committer.error.message = true

    expect(await CommitError()).toEqual(true)
  })
})
