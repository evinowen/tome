import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import * as node_fs from 'node:fs'
import * as NodeGit from 'nodegit'
import RepositoryCommitterDelegate from '@/objects/repository/delegates/RepositoryCommitterDelegate'
import { mocked_repository_index } from '?/mocks/nodegit'

jest.mock('node:path')
jest.mock('node:fs')
jest.mock('nodegit')

const mocked_node_fs = jest.mocked(node_fs)

describe('objects/repository/delegates/RepositoryCommitterDelegate', () => {
  let path: string
  let repository: any
  let repository_inspector_delegate: any

  beforeEach(async () => {
    path = '/repository'
    repository = await NodeGit.Repository.open(path)

    repository.refreshIndex = jest.fn(() => mocked_repository_index)
    repository_inspector_delegate = {
      inspect_staged: () => [
        { path: './test_path/first_file.md', type: 0 },
        { path: './test_path/second_file.md', type: 0 },
        { path: './test_path/third_file.md', type: 0 },
      ],
      inspect_available: () => [
        { path: './test_path/first_file.md', type: 0 },
        { path: './test_path/second_file.md', type: 0 },
        { path: './test_path/third_file.md', type: 0 },
      ],
    }
  })

  it('should instantiate without error', async () => {
    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    expect(repository_committer_delegate).not.toBeUndefined()
  })

  it('should stage all available files with stagePath when query is "*" on call to stage', async () => {
    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate
    repository_committer_delegate.stage_path = jest.fn(async () => {})

    await repository_committer_delegate.stage('*')

    expect(repository_committer_delegate.stage_path).toHaveBeenCalledTimes(3)
  })

  it('should stage provided path add with stagePath when query is a path on call to stage', async () => {
    const file_target = './test_path/file.md'

    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate

    mocked_node_fs.promises.access.mockImplementationOnce(async () => {})

    const notify = jest.fn()

    await repository_committer_delegate.stage(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(mocked_repository_index.addByPath).toHaveBeenCalledTimes(1)
  })

  it('should stage provided path remove with stagePath when query is a path on call to stage', async () => {
    const file_target = './test_path/file.md'

    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate

    mocked_node_fs.promises.access.mockImplementationOnce(async () => {
      throw new Error('Error')
    })

    const notify = jest.fn()

    await repository_committer_delegate.stage(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(mocked_repository_index.removeByPath).toHaveBeenCalledTimes(1)
  })

  it('should reset all staged files with resetPath when query is "*" on call to reset', async () => {
    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate
    repository_committer_delegate.reset_path = jest.fn(async () => {})

    await repository_committer_delegate.reset('*')

    expect(repository_committer_delegate.reset_path).toHaveBeenCalledTimes(3)
  })

  it('should reset provided path with resetPath when query is a path on call to reset', async () => {
    const file_target = './test_path/file.md'

    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate

    const notify = jest.fn()

    await repository_committer_delegate.reset(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(1)
  })

  it('should create a commit with provided information on call to commit', async () => {
    const name = 'Test Name'
    const email = 'text@example.com'
    const message = 'Test Commit Message'

    const repository_committer_delegate = new RepositoryCommitterDelegate(repository)
    repository_committer_delegate.inspector = repository_inspector_delegate

    await repository_committer_delegate.commit(name, email, message)

    expect(repository.createCommit).toHaveBeenCalledTimes(1)
  })
})
