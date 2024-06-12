/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryComparatorDelegate from '@/objects/repository/delegates/RepositoryComparatorDelegate'
import RepositoryPatch from '@/objects/repository/RepositoryPatch'

jest.mock('nodegit')
jest.mock('@/objects/repository/RepositoryPatch')

async function* mocked_RepositoryPatch_compile () {
  yield { name: 'file-example-1.md', path: '/project/file-example-1.md', lines: [] }
  yield { name: 'file-example-2.md', path: '/project/file-example-2.md', lines: [] }
  yield { name: 'file-example-3.md', path: '/project/file-example-3.md', lines: [] }
}

describe('objects/repository/delegates/RepositoryComparatorDelegate', () => {
  let path: string
  let repository: any

  beforeEach(async () => {
    path = '/repository'
    repository = await NodeGit.Repository.open(path)

    RepositoryPatch.compile = jest.fn(mocked_RepositoryPatch_compile) as any
  })

  it('should instantiate without error', async () => {
    const repository_comparator_delegate = new RepositoryComparatorDelegate(repository)
    expect(repository_comparator_delegate).not.toBeUndefined()
  })

  it('should retrieve NodeGit diff for commit OID and pass to RepositoryPatch.compile on call to diff_commit', async () => {
    const oid = '1234'

    const repository_comparator_delegate = new RepositoryComparatorDelegate(repository)

    await repository_comparator_delegate.diff_commit(oid)

    expect(RepositoryPatch.compile).toHaveBeenCalledTimes(1)
  })

  it('should retrieve NodeGit diff for a path and pass to RepositoryPatch.compile on call to diff_path ', async () => {
    const file_target = './test_path/file.md'

    const repository_comparator_delegate = new RepositoryComparatorDelegate(repository)

    await repository_comparator_delegate.diff_path(file_target)

    expect(RepositoryPatch.compile).toHaveBeenCalledTimes(1)
  })
})
