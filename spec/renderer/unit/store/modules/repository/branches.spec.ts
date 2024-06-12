import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'

/* @/api */
import api from '@/api'
vi.mock('@/api', () => ({
  default: {
    repository: {
      branch_status: vi.fn(async () => ({ active: 'master', list: [] })),
      branch_create: vi.fn(async () => ({ success: true })),
      branch_select: vi.fn(async () => ({ success: true })),
      branch_rename: vi.fn(async () => ({ success: true })),
      branch_remove: vi.fn(async () => ({ success: true })),
    },
  },
}))

/* @/store/modules/log */
vi.mock('@/store/modules/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

/* @/store/modules/repository/history */
import { fetch_error_store } from '@/store/modules/error'
vi.mock('@/store/modules/error', () => ({
  fetch_error_store: vi.fn(),
}))

/* @/store/modules/repository/history */
import { fetch_option_store } from '@/store/modules/option'
vi.mock('@/store/modules/option', () => ({
  fetch_option_store: vi.fn(),
}))

/* @/store/modules/repository/history */
import { fetch_repository_history_store } from '@/store/modules/repository/history'
vi.mock('@/store/modules/repository/history', () => ({
  fetch_repository_history_store: vi.fn(),
}))

/* @/store/modules/repository/committer */
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
vi.mock('@/store/modules/repository/committer', () => ({
  fetch_repository_committer_store: vi.fn(),
}))

describe('store/modules/repository/branches', () => {
  let repository_branches

  let error
  let option
  let repository_history
  let repository_committer

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_branches = fetch_repository_branches_store()

    error = {
      show: vi.fn(),
    }

    vi.mocked(fetch_error_store).mockReturnValue(error)

    option = {
      show: vi.fn(),
    }

    vi.mocked(fetch_option_store).mockReturnValue(option)

    repository_history = {
      reload: vi.fn(),
    }

    vi.mocked(fetch_repository_history_store).mockReturnValue(repository_history)

    repository_committer = {
      inspect: vi.fn(),
    }

    vi.mocked(fetch_repository_committer_store).mockReturnValue(repository_committer)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.branch_status upon load load dispatch', async () => {
    await repository_branches.load()

    expect(api.repository.branch_status).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.branch_create upon load create dispatch', async () => {
    const name = 'master'

    await repository_branches.create(name)

    expect(api.repository.branch_create).toHaveBeenCalledTimes(1)
    expect(api.repository.branch_create).toHaveBeenCalledWith(name)
  })

  /* TODO: Refactor API object to be retrieved from function to allow better mocking */

  // it('should call error.show if error with "exists" reason returned from api.repository.branch_create upon load create dispatch', async () => {
  //   api.repository.branch_select = async () => ({ error: 'error-message', reason: 'exists' })

  //   const name = 'master'

  //   await repository_branches.create(name)

  //   expect(error.show).toHaveBeenCalled()
  // })

  // it('should call error.show if error with "unknown" reason returned from api.repository.branch_create upon load create dispatch', async () => {
  //   api.repository.branch_select = async () => ({ error: 'error-message', reason: 'unknown' })

  //   const name = 'master'

  //   await repository_branches.create(name)

  //   expect(error.show).toHaveBeenCalled()
  // })

  it('should trigger api.repository.branch_select upon load select dispatch', async () => {
    const name = 'master'

    await repository_branches.select(name)

    expect(api.repository.branch_select).toHaveBeenCalledTimes(1)
    expect(api.repository.branch_select).toHaveBeenCalledWith(name)
  })

  it('should not reload history when api.repository.branch_select returns success upon load select dispatch', async () => {
    api.repository.branch_select = async () => ({ error: 'error-message' })

    const name = 'master'

    await repository_branches.select(name)

    expect(repository_history.reload).not.toHaveBeenCalled()
  })

  it('should reload history when api.repository.branch_select returns success upon load select dispatch', async () => {
    api.repository.branch_select = async () => ({ success: true })

    const name = 'master'

    await repository_branches.select(name)

    expect(repository_history.reload).toHaveBeenCalled()
  })

  it('should not inspect branch when api.repository.branch_select returns success upon load select dispatch', async () => {
    api.repository.branch_select = async () => ({ error: 'error-message' })

    const name = 'master'

    await repository_branches.select(name)

    expect(repository_committer.inspect).not.toHaveBeenCalled()
  })

  it('should inspect branch when api.repository.branch_select returns success upon load select dispatch', async () => {
    api.repository.branch_select = async () => ({ success: true })

    const name = 'master'

    await repository_branches.select(name)

    expect(repository_committer.inspect).toHaveBeenCalled()
  })

  it('should trigger api.repository.branch_rename upon load rename dispatch', async () => {
    const name = 'master'
    const value = 'main'

    await repository_branches.rename({ name, value })

    expect(api.repository.branch_rename).toHaveBeenCalledTimes(1)
    expect(api.repository.branch_rename).toHaveBeenCalledWith(name, value)
  })

  it('should trigger api.repository.branch_remove upon load remove dispatch', async () => {
    const name = 'master'
    await repository_branches.remove(name)

    expect(api.repository.branch_remove).toHaveBeenCalledTimes(1)
    expect(api.repository.branch_remove).toHaveBeenCalledWith(name)
  })
})
