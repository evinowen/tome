import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_error_store } from '@/store/modules/error'
import BranchRemoveError, { BranchRemoveErrorTitle, BranchRemoveErrorFactory } from '@/objects/errors/BranchRemoveError'

describe('objects/errors/BranchRemoveError', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  it('should return false if result.success is true when CommitError is executed', async () => {
    const result = { success: true }

    const value = await BranchRemoveError(result)

    expect(value).toEqual(false)
  })

  it('should return true is result.success is false when CommitError is executed', async () => {
    const result = { success: false }

    const value = await BranchRemoveError(result)

    expect(value).toEqual(true)
  })

  it('should call error.show with Unknown error message while result.error is not recognized when CommitError is executed', async () => {
    const result = { reason: Math.random().toString(), error: 'unknown-error-message' }

    await BranchRemoveError(result)

    const error = fetch_error_store()
    const message = BranchRemoveErrorFactory.Unknown(result.error)
    expect(error.show).toHaveBeenCalledWith(BranchRemoveErrorTitle, message)
  })
})
