import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import AutoCommit from '@/objects/performances/AutoCommit'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/AutoCommit', () => {
  let dispatch
  let repository_committer_signature_check = vi.fn(() => false)
  let error_show = vi.fn(() => false)

  beforeEach(() => {
    dispatch = vi.fn(async (action) => {
      switch (action) {
        case 'repository/committer/signature/check':
          return repository_committer_signature_check()

        case 'error/show':
          return error_show()

        default:
          return false
      }
    })

    repository_committer_signature_check = vi.fn(() => false)
    error_show = vi.fn(() => false)
  })

  it('should not trigger Commit performance when "repository/committer/signature/check" returns false upon call to AutoCommit.perform', async () => {
    repository_committer_signature_check.mockReturnValue(false)

    await AutoCommit.perform(dispatch)

    expect(dispatch).not.toHaveBeenCalledWith('system/perform', 'commit')
  })

  it('should trigger Commit performance when "repository/committer/signature/check" returns true upon call to AutoCommit.perform', async () => {
    repository_committer_signature_check.mockReturnValue(true)

    await AutoCommit.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('system/perform', 'commit')
  })
})