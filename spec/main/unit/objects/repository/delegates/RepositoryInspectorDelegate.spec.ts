/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryInspectorDelegate from '@/objects/repository/delegates/RepositoryInspectorDelegate'

jest.mock('nodegit')
jest.mock('@/objects/repository/RepositoryFile')

describe('objects/repository/delegates/RepositoryInspectorDelegate', () => {
  let path: string
  let repository: any

  beforeEach(async () => {
    path = '/repository'
    repository = await NodeGit.Repository.open(path)
  })

  it('should instantiate without error', async () => {
    const repository_inspector_delegate = new RepositoryInspectorDelegate(repository)
    expect(repository_inspector_delegate).not.toBeUndefined()
  })

  it('should call and wait inspect_staged and inspect_available on inspect_all', async () => {
    const repository_inspector_delegate = new RepositoryInspectorDelegate(repository)
    const mock_inspect_staged = jest.spyOn(repository_inspector_delegate, 'inspect_staged').mockImplementation(async () => [])
    const mock_inspect_available = jest.spyOn(repository_inspector_delegate, 'inspect_available').mockImplementation(async () => [])

    await repository_inspector_delegate.inspect_all()

    expect(mock_inspect_staged).toHaveBeenCalledTimes(1)
    expect(mock_inspect_available).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect on call to inspect_staged', async () => {
    const repository_inspector_delegate = new RepositoryInspectorDelegate(repository)
    const mock_inspect = jest.spyOn(repository_inspector_delegate, 'inspect').mockImplementation(async () => [])

    await repository_inspector_delegate.inspect_staged()

    expect(mock_inspect).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect on call to inspect_available ', async () => {
    const repository_inspector_delegate = new RepositoryInspectorDelegate(repository)
    const mock_inspect = jest.spyOn(repository_inspector_delegate, 'inspect').mockImplementation(async () => [])

    await repository_inspector_delegate.inspect_available()

    expect(mock_inspect).toHaveBeenCalledTimes(1)
  })

  it('should load status of files updated based on options on call to inspect ', async () => {
    const repository_inspector_delegate = new RepositoryInspectorDelegate(repository)
    const mock_getStatus = jest.spyOn(repository, 'getStatus').mockImplementation(async () => [ {}, {}, {} ])
    const options = {}

    await repository_inspector_delegate.inspect(options)

    expect(mock_getStatus).toHaveBeenCalledWith(options)
  })
})
