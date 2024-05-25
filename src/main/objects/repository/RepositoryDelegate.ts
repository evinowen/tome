import * as NodeGit from 'nodegit'
import { RepositoryNotLoadedError } from './RepositoryErrors'

export default class RepositoryDelegate {
  repository: NodeGit.Repository

  constructor (repository: NodeGit.Repository) {
    if (repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    this.repository = repository
  }
}
