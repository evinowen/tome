import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export interface RepositoryHistoryItem {
  oid: string
  date: Date
  message: string
}

export default class RepositoryHistoryDelegate extends RepositoryDelegate {
  static ItemLimit = 20

  items: RepositoryHistoryItem[] = []

  async load () {
    let commit

    try {
      const head = await this.repository.head()

      commit = await this.repository.getBranchCommit(head)
    } catch {
      return
    }

    this.items = []

    for (let limit = RepositoryHistoryDelegate.ItemLimit; commit && limit > 0; limit--) {
      this.items.push({
        oid: commit.id().tostrS(),
        date: commit.date(),
        message: commit.message(),
      })

      if (commit.parentcount()) {
        commit = await commit.parent(0)
      } else {
        break
      }
    }
  }
}
