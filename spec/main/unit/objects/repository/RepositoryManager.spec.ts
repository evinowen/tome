/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, afterEach, it, expect } from '@jest/globals'
import RepositoryManager from '@/objects/repository/RepositoryManager'
import * as node_fs from 'node:fs'
import * as NodeGit from 'nodegit'
import { mocked_repository } from '?/mocks/nodegit'
import { RepositoryHeadDetachedError, RepositoryInaccessableError, RepositoryMergingError, RepositoryRebasingError } from '@/objects/repository/RepositoryErrors'

jest.mock('node:fs')
jest.mock('node:path')
jest.mock('nodegit')
jest.mock('@/objects/repository/RepositoryPatch')
jest.mock('@/objects/repository/RepositoryCredentials')
jest.mock('@/objects/repository/delegates/RepositoryBranchDelegate')
jest.mock('@/objects/repository/delegates/RepositoryCommitterDelegate')
jest.mock('@/objects/repository/delegates/RepositoryComparatorDelegate')
jest.mock('@/objects/repository/delegates/RepositoryHistoryDelegate')
jest.mock('@/objects/repository/delegates/RepositoryInspectorDelegate')
jest.mock('@/objects/repository/delegates/RepositoryRemoteDelegate')

describe('components/repository/RepositoryManager', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initalize new RepositoryManager upon call to create with path', async () => {
    const path = '/repository'
    const repository_manager = await RepositoryManager.create(path)

    expect(repository_manager.path).toEqual(path)
    expect(repository_manager.name).toEqual('repository')

    expect(repository_manager.history).not.toBeUndefined()
    expect(repository_manager.remotes).not.toBeUndefined()
    expect(repository_manager.branch).not.toBeUndefined()
    expect(repository_manager.inspector).not.toBeUndefined()
    expect(repository_manager.comparator).not.toBeUndefined()
    expect(repository_manager.committer).not.toBeUndefined()
  })

  it('should create new repository with call to NodeGit.Repository.init when .git directory does not exist upon call to create with path', async () => {
    const mocked_NodeGit_Repository_open = jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => (mocked_repository as any))
    const mocked_NodeGit_Repository_init = jest.spyOn(NodeGit.Repository, 'init').mockImplementation(async () => (mocked_repository as any))

    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {
      throw new Error('Error')
    })

    const path = '/repository'
    await RepositoryManager.create(path)

    expect(mocked_NodeGit_Repository_open).not.toHaveBeenCalled()
    expect(mocked_NodeGit_Repository_init).toHaveBeenCalled()
  })

  it('should open existing repository with call to NodeGit.Repository.open when .git directory does exist upon call to create with path', async () => {
    const mocked_NodeGit_Repository_open = jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => (mocked_repository as any))
    const mocked_NodeGit_Repository_init = jest.spyOn(NodeGit.Repository, 'init').mockImplementation(async () => (mocked_repository as any))

    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {})

    const path = '/repository'
    await RepositoryManager.create(path)

    expect(mocked_NodeGit_Repository_open).toHaveBeenCalled()
    expect(mocked_NodeGit_Repository_init).not.toHaveBeenCalled()
  })

  it('should throw RepositoryInaccessableError when no repository is opened on call to create with path', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => undefined)
    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {})

    const path = '/repository'
    await expect(RepositoryManager.create(path)).rejects.toThrowError(RepositoryInaccessableError)
  })

  it('should throw RepositoryHeadDetachedError when repository reports head detached upon call to create with path', async () => {
    mocked_repository.headDetached.mockImplementationOnce(() => 1)
    jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => (mocked_repository as any))
    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {})

    const path = '/repository'
    await expect(RepositoryManager.create(path)).rejects.toThrowError(RepositoryHeadDetachedError)
  })

  it('should throw RepositoryMergingError when repository reports currently merging upon call to create with path', async () => {
    mocked_repository.isMerging.mockImplementationOnce(() => true)
    jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => (mocked_repository as any))
    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {})

    const path = '/repository'
    await expect(RepositoryManager.create(path)).rejects.toThrowError(RepositoryMergingError)
  })

  it('should throw RepositoryRebasingError when repository reports currently rebasing upon call to create with path', async () => {
    mocked_repository.isRebasing.mockImplementationOnce(() => true)
    jest.spyOn(NodeGit.Repository, 'open').mockImplementation(async () => (mocked_repository as any))
    jest.spyOn(node_fs.promises, 'access').mockImplementation(async () => {})

    const path = '/repository'
    await expect(RepositoryManager.create(path)).rejects.toThrowError(RepositoryRebasingError)
  })
})
