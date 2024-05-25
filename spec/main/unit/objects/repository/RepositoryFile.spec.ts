import { jest, describe, beforeEach, it, expect } from '@jest/globals'
import RepositoryFile, { RepositoryFileType } from '@/objects/repository/RepositoryFile'

describe('objects/repository/RepositoryFile', () => {
  let file

  beforeEach(() => {
    file = {
      path: jest.fn((): string => ''),

      isNew: jest.fn((): boolean => false),
      isModified: jest.fn((): boolean => false),
      isRenamed: jest.fn((): boolean => false),
      isDeleted: jest.fn((): boolean => false),
    }
  })

  it('should load path from NodeGit.StatusFile object', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.path).toEqual(path)
  })

  it('should set tyle to RepositoryFileType.Unknown if NodeGit.StatusFile returns false for all checks', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.type).toEqual(RepositoryFileType.Unknown)
  })

  it('should set tyle to RepositoryFileType.New if NodeGit.StatusFile.isNew returns true', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)
    file.isNew.mockImplementationOnce(() => true)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.type).toEqual(RepositoryFileType.New)
  })

  it('should set tyle to RepositoryFileType.Modified if NodeGit.StatusFile.isModified returns true', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)
    file.isModified.mockImplementationOnce(() => true)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.type).toEqual(RepositoryFileType.Modified)
  })

  it('should set tyle to RepositoryFileType.Renamed if NodeGit.StatusFile.isRenamed returns true', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)
    file.isRenamed.mockImplementationOnce(() => true)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.type).toEqual(RepositoryFileType.Renamed)
  })

  it('should set tyle to RepositoryFileType.Deleted if NodeGit.StatusFile.isDeleted returns true', async () => {
    const path = './test_file.txt'

    file.path.mockImplementation(() => path)
    file.isDeleted.mockImplementationOnce(() => true)

    const repository_file = new RepositoryFile(file)

    expect(repository_file.type).toEqual(RepositoryFileType.Deleted)
  })
})
