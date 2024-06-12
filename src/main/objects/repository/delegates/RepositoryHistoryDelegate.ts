import * as NodeGit from 'nodegit'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export interface RepositoryHistoricalCommit {
  oid: string
  date: Date
  message: string
  root: boolean
}

export class RepositoryHistoryHeadNotFoundError extends Error {}
export class RepositoryHistoryCommitNotFoundError extends Error {}

export default class RepositoryHistoryDelegate extends RepositoryDelegate {
  static ItemLimit = 10

  items: RepositoryHistoricalCommit[] = []

  pages = new Map<number, NodeGit.Commit>()

  async load (page = 1) {
    let commit: NodeGit.Commit

    if (this.pages.has(page)) {
      commit = this.pages.get(page)
    } else if (page === 1) {
      try {
        const reference = await this.repository.head()
        commit = await this.repository.getReferenceCommit(reference)
        this.pages.set(page, commit)
      } catch {
        throw new RepositoryHistoryHeadNotFoundError()
      }
    } else {
      throw new RepositoryHistoryCommitNotFoundError()
    }

    this.items = []

    for (let limit = RepositoryHistoryDelegate.ItemLimit; commit && limit > 0; limit--) {
      const item = {
        oid: commit.id().tostrS(),
        date: commit.date(),
        message: commit.message(),
        root: commit.parentcount() < 1,
      }

      this.items.push(item)

      if (item.root) {
        commit = undefined
        break
      } else {
        commit = await commit.parent(0)
      }
    }

    if (commit) {
      this.pages.set(page + 1, commit)
    }
  }

  clear () {
    this.pages.clear()
  }
}
