/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, it, expect, jest } from '@jest/globals'
import * as NodeGit from 'nodegit'
import RepositoryTagsDelegate from '@/objects/repository/delegates/RepositoryTagsDelegate'

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
  Object: {
    lookup: jest.fn(),
  },
  Tag: {
    createLightweight: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(() => [
      'v1.0.0',
      'v2.0.0',
      'v3.0.0',
    ]),
  },
}))

describe('objects/repository/delegates/RepositoryTagsDelegate', () => {
  let repository: any

  beforeEach(() => {
    const commit = {
      date: jest.fn(() => new Date()),
      id: jest.fn(() => ({
        tostrS: jest.fn(() => '1234'),
      })),
    }

    repository = {
      getCommit: jest.fn(() => commit),
      getReferenceCommit: jest.fn(() => commit),
    }
  })

  it('should instantiate without error', async () => {
    const repository_tags_delegate = new RepositoryTagsDelegate(repository)
    expect(repository_tags_delegate).not.toBeUndefined()
  })

  it('should load list of all braches upon call to fetch', async () => {
    const repository_tags_delegate = new RepositoryTagsDelegate(repository)
    await repository_tags_delegate.fetch()

    expect(repository_tags_delegate.list).toHaveLength(3)
  })

  it('should should call to NodeGit.Tag.createLightweight upon call to create', async () => {
    const tag = 'v1.0.0'
    const oid = '1234'

    const repository_tags_delegate = new RepositoryTagsDelegate(repository)
    await repository_tags_delegate.create(tag, oid)

    expect(NodeGit.Tag.createLightweight).toHaveBeenCalled()
  })

  it('should should call to NodeGit.Tag.delete upon call to remove', async () => {
    const tag = 'v1.0.0'

    const repository_tags_delegate = new RepositoryTagsDelegate(repository)
    await repository_tags_delegate.remove(tag)

    expect(NodeGit.Tag.delete).toHaveBeenCalledWith(repository, tag)
  })
})
