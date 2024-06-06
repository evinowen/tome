import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import * as api_module from '@/api'
import { reset_inspect } from '?/builders/api/repository'
import builders from '?/builders'

vi.mock('@/store/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/committer', () => {
  let repository_committer

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_committer = fetch_repository_committer_store()

    reset_inspect()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should instruct the repository to commit staged with details on dispatch of commit action', async () => {
    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    await repository_committer.commit(data)

    expect(mocked_api.repository.commit).toHaveBeenCalledTimes(1)
  })

  it('should clear commit process flag on dispatch of commit action', async () => {
    repository_committer.process.commit = true

    expect(repository_committer.process.commit).toEqual(true)

    const data = {
      name: 'Test',
      email: 'text@example.com',
      message: 'Test Commit',
    }

    await repository_committer.commit(data)

    expect(repository_committer.process.commit).toEqual(false)
  })

  it('should instruct the repository to stage the query on dispatch of stage', async () => {
    await repository_committer.stage('/test.file.1.md')

    expect(mocked_api.repository.stage).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to reset the query on dispatch of reset', async () => {
    await repository_committer.reset('/test.file.1.md')

    expect(mocked_api.repository.reset).toHaveBeenCalledTimes(1)
  })

  it('should instruct the repository to run inspect cycle on dispatch of inspect', async () => {
    await repository_committer.inspect()

    expect(mocked_api.repository.inspect).toHaveBeenCalledTimes(1)
  })
})
