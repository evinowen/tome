import * as NodeGit from 'nodegit'

export enum RepositoryFileType {
  New = 'new',
  Modified = 'modified',
  Renamed = 'renamed',
  Deleted = 'deleted',
  Unknown = 'unknown',
}

export default class RepositoryFile {
  path: string
  type: RepositoryFileType

  constructor (status: NodeGit.StatusFile) {
    this.path = status.path()
    this.type = RepositoryFile.MapType(status)
  }

  static MapType (status: NodeGit.StatusFile) {
    if (status.isNew()) {
      return RepositoryFileType.New
    }

    if (status.isModified()) {
      return RepositoryFileType.Modified
    }

    if (status.isRenamed()) {
      return RepositoryFileType.Renamed
    }

    if (status.isDeleted()) {
      return RepositoryFileType.Deleted
    }

    return RepositoryFileType.Unknown
  }
}
