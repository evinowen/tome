import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import RepositoryPatch from '@/objects/repository/RepositoryPatch'
import * as NodeGit from 'nodegit'

jest.mock('nodegit')

describe('components/repository/RepositoryPatch', () => {
  let patch
  let file_new
  let file_old
  let hunks
  let hunk
  let lines

  beforeEach(() => {
    file_new = {
      path: jest.fn(() => './file.path'),
    }

    file_old = {
      path: jest.fn(() => './file.path'),
    }

    lines = [
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.ADDITION),
        content: jest.fn(() => 'first line'),
      },
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.DELETION),
        content: jest.fn(() => 'second line'),
      },
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.CONTEXT),
        content: jest.fn(() => 'third line'),
      },
    ]

    hunk = {
      header: jest.fn(() => 'header'),
      lines: jest.fn(() => lines),
    }

    hunks = [ hunk ]

    patch = {
      oldFile: jest.fn(() => file_old),
      newFile: jest.fn(() => file_new),
      hunks: jest.fn(() => hunks),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should unwrap the NodeGit Patch data when passed into the build method', async () => {
    const repository_patch = await RepositoryPatch.build(patch)

    expect(repository_patch.lines).toHaveLength(4)

    expect(repository_patch.lines[0].type).toEqual(NodeGit.Diff.LINE.HUNK_HDR)
    expect(repository_patch.lines[0].line).toEqual('header')

    expect(repository_patch.lines[1].type).toEqual(NodeGit.Diff.LINE.ADDITION)
    expect(repository_patch.lines[1].line).toEqual('first line')

    expect(repository_patch.lines[2].type).toEqual(NodeGit.Diff.LINE.DELETION)
    expect(repository_patch.lines[2].line).toEqual('second line')

    expect(repository_patch.lines[3].type).toEqual(NodeGit.Diff.LINE.CONTEXT)
    expect(repository_patch.lines[3].line).toEqual('third line')
  })

  it('should have a path equal to the patch path after successful build method when path is not changing', async () => {
    const path = './test_path'
    file_old.path.mockReturnValue(path)
    file_new.path.mockReturnValue(path)

    const repository_patch = await RepositoryPatch.build(patch)

    expect(repository_patch.path).toEqual(path)
  })

  it('should have a path equal to the patch change after successful build method when path is changing', async () => {
    const old_path = './test_path'
    const new_path = './new_test_path'

    file_old.path.mockReturnValue(old_path)
    file_new.path.mockReturnValue(new_path)

    const repository_patch = await RepositoryPatch.build(patch)

    expect(repository_patch.path).toEqual(`${old_path} => ${new_path}`)
  })

  it('should iterate over patches within provided NodeGit.Diff upon call to compile', async () => {
    const diff: any = {
      patches: () => [
        patch,
        patch,
        patch,
      ],
    }

    const old_path = './test_path'
    const new_path = './new_test_path'

    file_old.path.mockReturnValue(old_path)
    file_new.path.mockReturnValue(new_path)

    const iterator = await RepositoryPatch.compile(diff)

    for await (const file of iterator) {
      expect(file.path).toEqual(`${old_path} => ${new_path}`)
    }
  })
})
