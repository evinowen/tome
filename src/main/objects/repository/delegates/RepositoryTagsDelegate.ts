import * as NodeGit from 'nodegit'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export interface RepositoryTagList {
  list: RepositoryTag[]
}

export interface RepositoryTag {
  name: string
  oid: string
  date: Date
}

export default class RepositoryTagsDelegate extends RepositoryDelegate {
  list: RepositoryTag[] = []
  active: string

  async fetch (): Promise<RepositoryTagList> {
    this.list.length = 0
    const tags = await NodeGit.Tag.list(this.repository)

    for (const name of tags) {
      const commit = await this.repository.getReferenceCommit(`refs/tags/${name}`)
      this.list.push({
        name,
        oid: commit.id().tostrS(),
        date: commit.date(),
      })
    }

    return { list: this.list }
  }

  async create (name: string, oid: string) {
    const commit = await this.repository.getCommit(oid)
    const object = await NodeGit.Object.lookup(this.repository, commit.id(), NodeGit.Object.TYPE.COMMIT)
    await NodeGit.Tag.createLightweight(this.repository, name, object, 0)
  }

  async remove (name: string) {
    await NodeGit.Tag.delete(this.repository, name)
  }
}
