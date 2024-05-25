import { describe, beforeEach, it, expect, jest } from '@jest/globals'
import RepositoryBranchDelegate from '@/objects/repository/delegates/RepositoryBranchDelegate'

jest.mock('node:path')
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => 'ref: refs/heads/master\r\n'),
}))

describe('objects/repository/delegates/RepositoryBranchDelegate', () => {
  let repository: any

  beforeEach(() => {
    repository = {
      headUnborn: jest.fn(() => false),
      path: jest.fn(() => '/repository'),
      head: jest.fn(() => ({
        shorthand: jest.fn(() => 'master'),
      })),
    }
  })

  it('should instantiate without error', async () => {
    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    expect(repository_branch_delegate).not.toBeUndefined()
  })

  it('should load born branch upon call to load when Repository.headUnborn reports false', async () => {
    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.load()

    expect(repository_branch_delegate.name).toEqual('master')
  })

  it('should load unborn branch upon call to load when Repository.headUnborn reports false', async () => {
    repository.headUnborn.mockReturnValue(true)

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.load()

    expect(repository_branch_delegate.name).toEqual('master')
  })
})
