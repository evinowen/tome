/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, it, expect, jest } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryBranchDelegate from '@/objects/repository/delegates/RepositoryBranchDelegate'

jest.mock('node:path')
jest.mock('node:fs', () => ({
  readFileSync: jest.fn((path) => {
    switch (path) {
      case '/repository/.git/HEAD': {
        return 'ref: refs/heads/master\r\n'
      }
    }
  }),
}))

jest.mock('nodegit', () => ({
  Branch: {
    create: jest.fn(),
    delete: jest.fn(),
    lookup: jest.fn(),
    move: jest.fn(),
    BRANCH: {
      LOCAL: 1,
    },
  },
  Reference: {
    list: jest.fn(() => [
      'refs/heads/master',
      'refs/heads/dev',
      'refs/remotes/origin/master',
    ]),
    lookup: jest.fn(),
  },
}))

describe('objects/repository/delegates/RepositoryBranchDelegate', () => {
  let repository: any

  beforeEach(() => {
    repository = {
      headUnborn: jest.fn(() => false),
      path: jest.fn(() => '/repository/.git'),
      getReferenceCommit: jest.fn(() => ({
        date: jest.fn(() => new Date()),
      })),
      head: jest.fn(() => ({
        shorthand: jest.fn(() => 'master'),
      })),
      setHead: jest.fn(),
    }
  })

  it('should instantiate without error', async () => {
    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    expect(repository_branch_delegate).not.toBeUndefined()
  })

  it('should load born branch upon call to fetch_active_branch when Repository.headUnborn reports false', async () => {
    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.fetch_active_branch()

    expect(repository_branch_delegate.active).toEqual('master')
  })

  it('should load unborn branch upon call to fetch_active_branch when Repository.headUnborn reports false', async () => {
    repository.headUnborn.mockReturnValue(true)

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.fetch_active_branch()

    expect(repository_branch_delegate.active).toEqual('master')
  })

  it('should load list of all braches upon call to fetch_branch_list', async () => {
    repository.headUnborn.mockReturnValue(true)

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.fetch_branch_list()

    expect(repository_branch_delegate.list).toHaveLength(2)
  })

  it('should return results of fetch_active_branch and fetch_branch_list braches upon call to status', async () => {
    repository.headUnborn.mockReturnValue(true)

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    const result = await repository_branch_delegate.status()

    expect(result.active).toEqual('master')
    expect(result.list).toHaveLength(2)
  })

  it('should should call to NodeGit.Branch.create upon call to create', async () => {
    repository.headUnborn.mockReturnValue(true)

    const branch = 'new-branch'

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.status()

    await repository_branch_delegate.create(branch)

    expect(NodeGit.Branch.create).toHaveBeenCalled()
  })

  it('should should call to Repository.setHead upon call to create', async () => {
    repository.headUnborn.mockReturnValue(true)

    const branch = 'dev'

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.status()

    await repository_branch_delegate.select(branch)

    expect(repository.setHead).toHaveBeenCalledWith(`refs/heads/${branch}`)
  })

  it('should should call to NodeGit.Branch.move upon call to rename', async () => {
    repository.headUnborn.mockReturnValue(true)

    const branch = 'dev'
    const branch_new = 'dev2'

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.status()

    await repository_branch_delegate.rename(branch, branch_new)

    expect(NodeGit.Branch.move).toHaveBeenCalled()
  })

  it('should should call to NodeGit.Branch.delete upon call to remove', async () => {
    repository.headUnborn.mockReturnValue(true)

    const branch = 'dev'

    const repository_branch_delegate = new RepositoryBranchDelegate(repository)
    await repository_branch_delegate.status()

    await repository_branch_delegate.remove(branch)

    expect(NodeGit.Branch.delete).toHaveBeenCalled()
  })
})
