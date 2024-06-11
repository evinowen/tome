/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryRemoteDelegate, { ErrorFactory } from '@/objects/repository/delegates/RepositoryRemoteDelegate'

jest.mock('nodegit')
jest.mock('@/objects/repository/RepositoryRemote')

describe('objects/repository/delegates/RepositoryRemoteDelegate', () => {
  let path: string
  let repository: any

  beforeEach(async () => {
    path = '/repository'
    repository = await NodeGit.Repository.open(path)
  })

  it('should instantiate without error', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)
    expect(repository_remote_delegate).not.toBeUndefined()
  })

  it('should populate list and map of remotes upon call to load', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)

    expect(repository_remote_delegate.list).toHaveLength(0)
    expect(repository_remote_delegate.map.size).toEqual(0)

    const mock_remote_list = [
      { name: () => 'remote-a', url: () => 'git@remote-a.com:username/example.git' },
      { name: () => 'remote-b', url: () => 'git@remote-b.com:username/example.git' },
      { name: () => 'remote-c', url: () => 'git@remote-c.com:username/example.git' },
    ]
    const mocked_getRemotes = jest.spyOn(repository, 'getRemotes').mockImplementation(() => mock_remote_list)

    await repository_remote_delegate.load()

    expect(mocked_getRemotes).toHaveBeenCalledTimes(1)
    expect(repository_remote_delegate.list).toHaveLength(mock_remote_list.length)
    expect(repository_remote_delegate.map.size).toEqual(mock_remote_list.length)
  })

  it('should call NodeGit.Remote.create to add new remote the reload remote list upon call to add', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)

    const mocked_NodeGit_Remote_create = jest.spyOn(NodeGit.Remote, 'create').mockImplementation(async () => ({} as any))
    const mocked_load = jest.spyOn(repository_remote_delegate, 'load').mockImplementation(async () => {})

    const name = 'origin'
    const url = 'git@example:username/example.git'

    await repository_remote_delegate.add(name, url)

    expect(mocked_NodeGit_Remote_create).toHaveBeenCalledWith(repository, name, url)
    expect(mocked_load).toHaveBeenCalledTimes(1)
  })

  it('should call NodeGit.Remote.delete to remove target remote the reload remote list upon call to remove', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)

    const mocked_NodeGit_Remote_delete = jest.spyOn(NodeGit.Remote, 'delete').mockImplementation(async () => ({} as any))
    const mocked_load = jest.spyOn(repository_remote_delegate, 'load').mockImplementation(async () => {})

    const name = 'origin'

    await repository_remote_delegate.remove(name)

    expect(mocked_NodeGit_Remote_delete).toHaveBeenCalledWith(repository, name)
    expect(mocked_load).toHaveBeenCalledTimes(1)
  })

  it('should assign new RepositoryRemote to active with assigned simple + objects matches from list + map upon call to select', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)
    repository_remote_delegate.credential = () => ({} as any)

    expect(repository_remote_delegate.active).toBeUndefined()

    const mock_remote_list = [
      { name: () => 'remote-a', url: () => 'git@remote-a.com:username/example.git' },
      { name: () => 'remote-b', url: () => 'git@remote-b.com:username/example.git' },
      { name: () => 'remote-c', url: () => 'git@remote-c.com:username/example.git' },
    ]
    jest.spyOn(repository, 'getRemotes').mockImplementation(() => mock_remote_list)

    await repository_remote_delegate.load()

    const remote_name = 'remote-a'
    const branch_name = 'master'

    await repository_remote_delegate.select(remote_name, branch_name)

    expect(repository_remote_delegate.active).not.toBeUndefined()
    expect(repository_remote_delegate.active.simple).not.toBeUndefined()
    expect(repository_remote_delegate.active.object).not.toBeUndefined()
  })

  it('should generate ErrorFactory.RemoteNotConfiguredError when provided remote is not found upon call to select', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)
    repository_remote_delegate.credential = () => ({} as any)

    expect(repository_remote_delegate.active).toBeUndefined()

    const mock_remote_list = [
      { name: () => 'remote-a', url: () => 'git@remote-a.com:username/example.git' },
      { name: () => 'remote-b', url: () => 'git@remote-b.com:username/example.git' },
      { name: () => 'remote-c', url: () => 'git@remote-c.com:username/example.git' },
    ]
    jest.spyOn(repository, 'getRemotes').mockImplementation(() => mock_remote_list)

    await repository_remote_delegate.load()

    const remote_name = 'remote-d'
    const branch_name = 'master'

    const result = await repository_remote_delegate.select(remote_name, branch_name)

    expect(result.error).toEqual(ErrorFactory.RemoteNotConfiguredError(remote_name))
  })

  it('should delete active RepositoryRemote upon call to close', async () => {
    const repository_remote_delegate = new RepositoryRemoteDelegate(repository)
    repository_remote_delegate.credential = () => ({} as any)

    expect(repository_remote_delegate.active).toBeUndefined()

    const mock_remote_list = [
      { name: () => 'remote-a', url: () => 'git@remote-a.com:username/example.git' },
      { name: () => 'remote-b', url: () => 'git@remote-b.com:username/example.git' },
      { name: () => 'remote-c', url: () => 'git@remote-c.com:username/example.git' },
    ]
    jest.spyOn(repository, 'getRemotes').mockImplementation(() => mock_remote_list)

    await repository_remote_delegate.load()

    const remote_name = 'remote-a'
    const branch_name = 'master'

    await repository_remote_delegate.select(remote_name, branch_name)

    expect(repository_remote_delegate.active).not.toBeUndefined()

    repository_remote_delegate.close()

    expect(repository_remote_delegate.active).toBeUndefined()
  })
})
