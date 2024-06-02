import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/comparator', () => {
  let repository_comparator

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_comparator = fetch_repository_comparator_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should instruct the repository to calculate diff for path on dispatch of diff action with path', async () => {
    const path = './path.md'

    await repository_comparator.diff({ path })

    expect(mocked_api.repository.diff_path).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to calculate diff for commit on dispatch of diff action with commit', async () => {
    const commit = {}

    await repository_comparator.diff({ commit })

    expect(mocked_api.repository.diff_commit).toHaveBeenCalledTimes(1)
  })
})
