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

  it('should complete Push performance upon call to Push.perform', async () => {
    const repository_remotes = fetch_repository_remotes_store()

    await Push.perform()

    expect(repository_remotes.push).toHaveBeenCalledWith()
  })
})
