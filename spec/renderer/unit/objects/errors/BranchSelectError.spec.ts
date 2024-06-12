import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_error_store } from '@/store/modules/error'
import BranchSelectError, { BranchSelectErrorTitle, BranchSelectErrorFactory } from '@/objects/errors/BranchSelectError'

describe('objects/errors/BranchSelectError', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should return false if result.success is true when CommitError is executed', async () => {
    const result = { success: true }
    const name = 'branch-name'

    const value = await BranchSelectError(result, name)

    expect(value).toEqual(false)
  })

  it('should return true is result.success is false when CommitError is executed', async () => {
    const result = { success: false }
    const name = 'branch-name'

    const value = await BranchSelectError(result, name)

    expect(value).toEqual(true)
  })

  it('should call error.show with Conflict error message while result.error is conflict when CommitError is executed', async () => {
    const result = { reason: 'conflict', error: 'conflict-error-message' }
    const name = 'branch-name'

    await BranchSelectError(result, name)

    const error = fetch_error_store()
    const message = BranchSelectErrorFactory.Conflict(name)
    expect(error.show).toHaveBeenCalledWith(BranchSelectErrorTitle, message)
  })

  it('should call error.show with Unknown error message while result.error is not recognized when CommitError is executed', async () => {
    const result = { reason: Math.random().toString(), error: 'unknown-error-message' }
    const name = 'branch-name'

    await BranchSelectError(result, name)

    const error = fetch_error_store()
    const message = BranchSelectErrorFactory.Unknown(name, result.error)
    expect(error.show).toHaveBeenCalledWith(BranchSelectErrorTitle, message)
  })
})
