import { remote } from 'electron'
import RepositoryPatch from '@/store/modules/tome/RepositoryPatch'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

const _path_basename = path => String(path).substring(String(path).lastIndexOf('/') + 1)

const path = {
  basename: jest.fn(_path_basename)
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'path': return path
  }
})

describe('RepositoryPatch.js', () => {
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
        origin: jest.fn(() => RepositoryPatch.LineType.CONTEXT),
        content: jest.fn(() => 'first line')
      },
      {
        origin: jest.fn(() => RepositoryPatch.LineType.ADDITION),
        content: jest.fn(() => 'second line')
      },
      {
        origin: jest.fn(() => RepositoryPatch.LineType.DELETION),
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

    expect(repository_patch.lines[0].type).toEqual(RepositoryPatch.LineType.HUNK_HDR)
    expect(repository_patch.lines[0].line).toEqual('header')

    expect(repository_patch.lines[1].type).toEqual(RepositoryPatch.LineType.CONTEXT)
    expect(repository_patch.lines[1].line).toEqual('first line')

    expect(repository_patch.lines[2].type).toEqual(RepositoryPatch.LineType.ADDITION)
    expect(repository_patch.lines[2].line).toEqual('second line')

    expect(repository_patch.lines[3].type).toEqual(RepositoryPatch.LineType.DELETION)
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
