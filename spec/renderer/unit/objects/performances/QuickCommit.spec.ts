import { describe, beforeEach, it, expect, vi } from 'vitest'
import QuickCommit from '@/objects/performances/QuickCommit'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/QuickCommit', () => {
  let dispatch
  let system_commit_confirm = vi.fn(() => false)
  let error_show = vi.fn(() => false)

  beforeEach(() => {
    dispatch = vi.fn(async (action) => {
      switch (action) {
        case 'system/commit_confirm':
          return system_commit_confirm()

        case 'error/show':
          return error_show()

        default:
          return false
      }
    })

    system_commit_confirm = vi.fn(() => false)
    error_show = vi.fn(() => false)
  })

  it('should show error when "system/commit_confirm" returns false upon call to QuickCommit.perform', async () => {
    system_commit_confirm.mockReturnValue(false)

    await QuickCommit.perform(dispatch)

    expect(error_show).toHaveBeenCalled()
  })

  it('should not trigger Commit performance when "system/commit_confirm" returns false upon call to QuickCommit.perform', async () => {
    system_commit_confirm.mockReturnValue(false)

    await QuickCommit.perform(dispatch)

    expect(dispatch).not.toHaveBeenCalledWith('system/perform', 'commit')
  })

  it('should trigger Commit performance when "system/commit_confirm" returns true upon call to QuickCommit.perform', async () => {
    system_commit_confirm.mockReturnValue(true)

    await QuickCommit.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('system/perform', 'commit')
  })
})
