export default class RepositoryFile {
  path = ''
  type = ''

  static Type = {
    NEW: 1,
    MODIFIED: 2,
    RENAMED: 3,
    DELETED: 4,
    UNKNOWN: 0
  }

  constructor(path, type) {
    this.path = path
    this.type = type || RepositoryFile.Type.UNKNOWN
  }
}
