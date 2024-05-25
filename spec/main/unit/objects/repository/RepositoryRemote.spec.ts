import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import RepositoryRemote, { RepositoryRemoteSimple } from '@/objects/repository/RepositoryRemote'

describe('objects/repository/RepositoryRemote', () => {
  let credentials: any

  let repository: any

  let head_commit: any
  let head_commit_id: any
  let reference_commit: any
  let reference_commit_id: any

  let remote_simple: RepositoryRemoteSimple
  let remote_object: any

  let branch_object: any

  beforeEach(() => {
    credentials = { callbacks: jest.fn() }

    head_commit = {
      id: jest.fn(() => head_commit_id),
      date: jest.fn(() => new Date()),
      message: jest.fn(() => 'Commit Message'),
      parent: jest.fn(),
    }

    head_commit_id = {
      cmp: jest.fn(() => 0),
      tostrS: jest.fn(() => '1234'),
    }

    reference_commit = {
      id: jest.fn(() => reference_commit_id),
      date: jest.fn(() => new Date()),
      message: jest.fn(() => 'Commit Message'),
      parent: jest.fn(),
    }

    reference_commit_id = {
      cmp: jest.fn(() => 0),
      tostrS: jest.fn(() => '1234'),
    }

    repository = {
      getCommit: jest.fn(() => head_commit),
      getReferenceCommit: jest.fn(() => reference_commit),
    }

    branch_object = {
      name: () => 'refs/heads/master',
      oid: () => 'abc123',
    }

    remote_simple = {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
    }

    remote_object = {
      connect: jest.fn(),
      owner: jest.fn(() => repository),
      push: jest.fn(),
      referenceList: jest.fn(async () => [ branch_object ]),
    }
  })

  it('should populate remote branch details upon call to select_branch', async () => {
    const branch_name = 'master'
    const repository_remote = new RepositoryRemote(() => credentials)
    repository_remote.object = remote_object
    repository_remote.simple = remote_simple

    await repository_remote.select_branch(branch_name)

    expect(repository_remote.branch.name).toEqual(branch_object.name())
    expect(repository_remote.branch.short).toEqual(branch_name)
    expect(repository_remote.branch.object).toEqual(branch_object)
  })

  it('should populate all commits upon call to select_branch when head commit is not found', async () => {
    repository.getCommit.mockReturnValue()
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const branch_name = 'master'
    const repository_remote = new RepositoryRemote(() => credentials)
    repository_remote.object = remote_object
    repository_remote.simple = remote_simple

    await repository_remote.select_branch(branch_name)

    expect(repository_remote.pending).toHaveLength(3)
  })

  it('should populate all commits upon call to select_branch when head commit has no match', async () => {
    head_commit_id.cmp.mockReturnValue(1)
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const branch_name = 'master'
    const repository_remote = new RepositoryRemote(() => credentials)
    repository_remote.object = remote_object
    repository_remote.simple = remote_simple

    await repository_remote.select_branch(branch_name)

    expect(repository_remote.pending).toHaveLength(3)
  })

  it('should populate commits until match is found upon call to select_branch when head commit has a match', async () => {
    head_commit_id.cmp.mockReturnValueOnce(1)
    head_commit_id.cmp.mockReturnValueOnce(1)
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => reference_commit)
    reference_commit.parent.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const branch_name = 'master'
    const repository_remote = new RepositoryRemote(() => credentials)
    repository_remote.object = remote_object
    repository_remote.simple = remote_simple

    await repository_remote.select_branch(branch_name)

    expect(repository_remote.pending).toHaveLength(2)
  })

  it('should make push call to remote object upon call to push', async () => {
    const branch_name = 'master'
    const repository_remote = new RepositoryRemote(() => credentials)
    repository_remote.object = remote_object
    repository_remote.simple = remote_simple

    await repository_remote.select_branch(branch_name)
    await repository_remote.push()

    expect(remote_object.push).toHaveBeenCalledTimes(1)

    const refspec = `refs/heads/${branch_name}:refs/heads/${branch_name}`
    expect(remote_object.push).toHaveBeenCalledWith([ refspec ], { callbacks: credentials.callbacks() })
  })
})
