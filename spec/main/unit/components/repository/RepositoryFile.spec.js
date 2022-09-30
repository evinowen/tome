import RepositoryFile from '@/components/repository/RepositoryFile'

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {}, Diff: { LINE: 1 } }))

describe('components/repository/RepositoryFile', () => {
  it('should store constructor input values', async () => {
    const path = './test_file.txt'
    const type = RepositoryFile.Type.NEW

    const repository_file = new RepositoryFile(path, type)

    expect(repository_file.path).toEqual(   path)
    expect(repository_file.type).toEqual(type)
  })
})
