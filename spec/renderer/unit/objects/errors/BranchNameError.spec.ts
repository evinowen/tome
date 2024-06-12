import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_error_store } from '@/store/modules/error'
import BranchNameError, { BranchNameErrorTitle, BranchNameErrorFactory } from '@/objects/errors/BranchNameError'

describe('objects/errors/BranchNameError', () => {
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

    const value = await BranchNameError(result, name)

    expect(value).toEqual(false)
  })

  it('should return true is result.success is false when CommitError is executed', async () => {
    const result = { success: false }
    const name = 'branch-name'

    const value = await BranchNameError(result, name)

    expect(value).toEqual(true)
  })

  it('should call error.show with Exists error message while result.error is exists when CommitError is executed', async () => {
    const result = { reason: 'exists', error: 'exists-error-message' }
    const name = 'branch-name'

    await BranchNameError(result, name)

    const error = fetch_error_store()
    const message = BranchNameErrorFactory.Exists(name)
    expect(error.show).toHaveBeenCalledWith(BranchNameErrorTitle, message)
  })

  it('should call error.show with Invalid error message while result.error is invalid when CommitError is executed', async () => {
    const result = { reason: 'invalid', error: 'invalid-error-message' }
    const name = 'branch-name'

    await BranchNameError(result, name)

    const error = fetch_error_store()
    const message = BranchNameErrorFactory.Invalid(name)
    expect(error.show).toHaveBeenCalledWith(BranchNameErrorTitle, message)
  })

  it('should call error.show with Unknown error message while result.error is not recognized when CommitError is executed', async () => {
    const result = { reason: Math.random().toString(), error: 'unknown-error-message' }
    const name = 'branch-name'

    await BranchNameError(result, name)

    const error = fetch_error_store()
    const message = BranchNameErrorFactory.Unknown(name, result.error)
    expect(error.show).toHaveBeenCalledWith(BranchNameErrorTitle, message)
  })
})
