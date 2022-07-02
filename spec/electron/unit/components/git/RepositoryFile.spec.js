import RepositoryFile from '@/../electron/components/git/RepositoryFile'

describe('Repository.js', () => {
  it('should store constructor input values', async () => {
    const path = './test_file.txt'
    const type = RepositoryFile.Type.NEW

    const repository_file = new RepositoryFile(path, type)

    expect(repository_file.path).toEqual(path)
    expect(repository_file.type).toEqual(type)
  })
})
