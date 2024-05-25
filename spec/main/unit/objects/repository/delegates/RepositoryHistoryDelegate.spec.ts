import { describe, beforeEach, it, expect } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryHistoryDelegate from '@/objects/repository/delegates/RepositoryHistoryDelegate'

describe('objects/repository/delegates/RepositoryHistoryDelegate', () => {
  let path: string
  let repository: any

  beforeEach(async () => {
    path = '/repository'
    repository = await NodeGit.Repository.open(path)
  })

  it('should instantiate without error', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)
    expect(repository_history_delegate).not.toBeUndefined()
  })

  it('should populate items upon call to load', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load()

    expect(repository_history_delegate.items.length).toBeGreaterThan(0)
  })
})
