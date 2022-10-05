import RepositoryPatch from '@/components/repository/RepositoryPatch'
import NodeGit from 'nodegit'

jest.mock('nodegit', () => ({
  Reset: {},
  Reference: {},
  Signature: {},
  Diff: {
    LINE: {
      HUNK_HDR: 72,
      VALUE_A: 1,
      VALUE_B: 2,
      VALUE_C: 3
    }
  }
}))

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

describe('components/repository/RepositoryPatch', () => {
  let patch
  let file
  let hunks
  let hunk
  let lines

  beforeEach(() => {
    file = {
      path: jest.fn(() => './file.path')
    }

    lines = [
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.VALUE_A),
        content: jest.fn(() => 'first line')
      },
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.VALUE_B),
        content: jest.fn(() => 'second line')
      },
      {
        origin: jest.fn(() => NodeGit.Diff.LINE.VALUE_C),
        content: jest.fn(() => 'third line')
      }
    ]

    hunk = {
      header: jest.fn(() => 'header'),
      lines: jest.fn(() => lines)
    }

    hunks = [hunk]

    patch = {
      oldFile: jest.fn(() => file),
      newFile: jest.fn(() => file),
      hunks: jest.fn(() => hunks)
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should unwrap the NodeGit Patch data when passed into the build method', async () => {
    const repository_patch = new RepositoryPatch()

    await repository_patch.build(patch)

    expect(repository_patch.lines.length).toEqual(4)

    expect(repository_patch.lines[0].type).toEqual(NodeGit.Diff.LINE.HUNK_HDR)
    expect(repository_patch.lines[0].line).toEqual('header')

    expect(repository_patch.lines[1].type).toEqual(NodeGit.Diff.LINE.VALUE_A)
    expect(repository_patch.lines[1].line).toEqual('first line')

    expect(repository_patch.lines[2].type).toEqual(NodeGit.Diff.LINE.VALUE_B)
    expect(repository_patch.lines[2].line).toEqual('second line')

    expect(repository_patch.lines[3].type).toEqual(NodeGit.Diff.LINE.VALUE_C)
    expect(repository_patch.lines[3].line).toEqual('third line')
  })

  it('should have a path equal to the patch path after successful build method when path is not changing', async () => {
    const path = './test_path'
    file.path.mockReturnValue(path)

    const repository_patch = new RepositoryPatch()

    await repository_patch.build(patch)

    expect(repository_patch.path).toEqual(path)
  })

  it('should have a path equal to the patch change after successful build method when path is changing', async () => {
    const old_path = './test_path'
    const new_path = './new_test_path'

    file.path.mockReturnValueOnce(old_path)
    file.path.mockReturnValueOnce(new_path)

    const repository_patch = new RepositoryPatch()

    await repository_patch.build(patch)

    expect(repository_patch.path).toEqual(`${old_path} => ${new_path}`)
  })
})
