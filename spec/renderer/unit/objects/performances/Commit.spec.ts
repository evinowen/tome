import { describe, beforeEach, it, expect, vi } from 'vitest'
import Commit from '@/objects/performances/Commit'

vi.mock('lodash', () => ({
  delay: (callback) => callback(),
}))

describe('objects/performances/Commit', () => {
  let dispatch
  let repository_committer_staged = vi.fn(() => false)
  let repository_committer_commit = vi.fn(() => false)
  let system_commit_push = vi.fn(() => false)

  beforeEach(() => {
    dispatch = vi.fn(async (action) => {
      switch (action) {
        case 'repository/committer/staged':
          return repository_committer_staged()

        case 'repository/committer/commit':
          return repository_committer_commit()

        case 'system/commit_push':
          return system_commit_push()

        default:
          return false
      }
    })

    repository_committer_staged = vi.fn(() => false)
    repository_committer_commit = vi.fn(() => false)
    system_commit_push = vi.fn(() => false)
  })

  it('should exit Commit performance when "repository/committer/staged" returns false upon call to Commit.perform', async () => {
    await Commit.perform(dispatch)

    expect(dispatch).not.toHaveBeenCalledWith('repository/committer/commit')
  })

  it('should complete Commit performance when "repository/committer/staged" returns true upon call to Commit.perform', async () => {
    repository_committer_staged.mockReturnValueOnce(true)

    await Commit.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('repository/committer/commit')
  })

  it('should not trigger QuickPush performance when "system/commit_push" returns false upon call to Commit.perform', async () => {
    repository_committer_staged.mockReturnValueOnce(true)
    system_commit_push.mockReturnValueOnce(false)

    await Commit.perform(dispatch)

    expect(dispatch).not.toHaveBeenCalledWith('system/perform', 'quick-push')
  })

  it('should trigger QuickPush performance when "system/commit_push" returns true upon call to Commit.perform', async () => {
    repository_committer_staged.mockReturnValueOnce(true)
    system_commit_push.mockReturnValueOnce(true)

    await Commit.perform(dispatch)

    expect(dispatch).toHaveBeenCalledWith('system/perform', 'quick-push')
  })

  it('should not trigger QuickPush performance when "system/commit_push" returns true if commit fails upon call to Commit.perform', async () => {
    repository_committer_staged.mockReturnValueOnce(true)
    system_commit_push.mockReturnValueOnce(true)

    repository_committer_commit.mockImplementation(() => {
      throw new Error('Error')
    })

    await Commit.perform(dispatch)

    expect(dispatch).not.toHaveBeenCalledWith('system/perform', 'quick-push')
  })
})
