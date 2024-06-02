/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import * as NodeGit from 'nodegit'
import { cloneDeep } from 'lodash'
import RepositoryHistoryDelegate from '@/objects/repository/delegates/RepositoryHistoryDelegate'
import { RepositoryHistoryHeadNotFoundError, RepositoryHistoryCommitNotFoundError } from '@/objects/repository/delegates/RepositoryHistoryDelegate'
import { mocked_commit } from '?/mocks/nodegit'

describe('objects/repository/delegates/RepositoryHistoryDelegate', () => {
  let path: string
  let repository: any

  beforeEach(async () => {
    path = '/repository'
    repository = cloneDeep(await NodeGit.Repository.open(path))
  })

  it('should instantiate without error', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)
    expect(repository_history_delegate).not.toBeUndefined()
  })

  it('should populate first page items upon call to load', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load()

    expect(repository_history_delegate.items.length).toBeGreaterThan(0)
    expect(repository_history_delegate.pages.has(1)).toEqual(true)
  })

  it('should populate first page items when page number one provided upon call to load', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load(1)

    expect(repository_history_delegate.items.length).toBeGreaterThan(0)
    expect(repository_history_delegate.pages.has(1)).toEqual(true)
  })

  it('should populate next page starting commit when there are more commits upon call to load', async () => {
    repository.getReferenceCommit = jest.fn(() => mocked_commit)
    mocked_commit.parentcount.mockImplementation(() => 1)
    mocked_commit.parent.mockImplementation(() => mocked_commit)

    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load(1)

    expect(repository_history_delegate.items.length).toBeGreaterThan(0)
    expect(repository_history_delegate.pages.has(1)).toEqual(true)

    expect(repository_history_delegate.pages.has(2)).toEqual(true)
  })

  it('should load page starting commit for page numbers larger than one upon call to load', async () => {
    repository.getReferenceCommit = jest.fn(() => mocked_commit)
    mocked_commit.parentcount.mockImplementation(() => 1)
    mocked_commit.parent.mockImplementation(() => mocked_commit)

    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load(1)

    expect(repository_history_delegate.items.length).toBeGreaterThan(0)
    expect(repository_history_delegate.pages.has(1)).toEqual(true)

    expect(repository_history_delegate.pages.has(2)).toEqual(true)

    const spy_pages_get = jest.spyOn(repository_history_delegate.pages, 'get')

    await repository_history_delegate.load(2)

    expect(spy_pages_get).toHaveBeenCalledWith(2)
  })

  it('should throw RepositoryHistoryHeadNotFoundError when first page commit cannot be found upon call to load', async () => {
    repository.head = jest.fn(() => {
      throw new Error('Error')
    })

    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await expect(repository_history_delegate.load(1)).rejects.toThrowError(RepositoryHistoryHeadNotFoundError)
  })

  it('should throw RepositoryHistoryCommitNotFoundError when page number larger than one that are not found in pages upon call to load', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await expect(repository_history_delegate.load(2)).rejects.toThrowError(RepositoryHistoryCommitNotFoundError)
  })

  it('should clear page starting commits upon call to clear', async () => {
    const repository_history_delegate = new RepositoryHistoryDelegate(repository)

    await repository_history_delegate.load()

    expect(repository_history_delegate.pages.has(1)).toEqual(true)

    await repository_history_delegate.clear()

    expect(repository_history_delegate.pages.has(1)).toEqual(false)
  })
})
