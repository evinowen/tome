import * as node_path from 'node:path'
import * as node_fs from 'node:fs'
import * as NodeGit from 'nodegit'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'

export interface RepositoryBranchStatus {
  active: string
  list: RepositoryBranch[]
}

export interface RepositoryBranch {
  reference: string
  name: string
  updated: Date
}

export default class RepositoryBranchDelegate extends RepositoryDelegate {
  static regex_head = /^(?:ref: )?refs\/heads\/(.*)$/m

  list: RepositoryBranch[] = []
  active: string

  async status (): Promise<RepositoryBranchStatus> {
    await this.fetch_branch_list()
    await this.fetch_active_branch()

    return { active: this.active, list: this.list }
  }

  async create (name: string) {
    const branch = this.list.find((branch) => branch.name === this.active)
    const reference = await NodeGit.Reference.lookup(this.repository, branch.reference)
    const commit = await this.repository.getReferenceCommit(reference)
    await NodeGit.Branch.create(this.repository, name, commit, 0)
  }

  async select (name: string) {
    const branch = this.list.find((branch) => branch.name === name)
    await this.repository.setHead(branch.reference)
  }

  async rename (name: string, value: string) {
    const reference = await NodeGit.Branch.lookup(this.repository, name, NodeGit.Branch.BRANCH.LOCAL)
    await NodeGit.Branch.move(reference, value, 0)
  }

  async remove (name: string) {
    const branch = this.list.find((branch) => branch.name === name)
    const reference = await NodeGit.Reference.lookup(this.repository, branch.reference)
    await NodeGit.Branch.delete(reference)
  }

  async fetch_branch_list () {
    this.list.length = 0
    const references = await NodeGit.Reference.list(this.repository)

    for (const reference of references) {
      const result = RepositoryBranchDelegate.regex_head.exec(reference)
      if (result) {
        const [ , branch ] = result
        const commit = await this.repository.getReferenceCommit(reference)
        this.list.push({
          reference,
          name: branch,
          updated: commit.date(),
        })
      }
    }
  }

  async fetch_active_branch () {
    this.active = this.repository.headUnborn()
      ? this.fetch_active_unborn_branch()
      : (await this.fetch_active_born_branch())
  }

  fetch_active_unborn_branch () {
    const headnode_path = node_path.join(this.repository.path(), 'HEAD')
    const head_raw = node_fs.readFileSync(headnode_path, 'utf8')

    let head_line_index = head_raw.length

    const head_line_index_n = head_raw.indexOf('\n')
    const head_line_index_r = head_raw.indexOf('\r')

    if (head_line_index_n >= 0) {
      head_line_index = Math.min(head_line_index_n, head_line_index)
    }

    if (head_line_index_r >= 0) {
      head_line_index = Math.min(head_line_index_r, head_line_index)
    }

    const head_trimmed = head_raw.slice(0, head_line_index)

    const head_parsed = RepositoryBranchDelegate.regex_head.exec(head_trimmed)

    if (head_parsed) {
      return head_parsed[1]
    }
  }

  async fetch_active_born_branch () {
    const branch = await this.repository.head()
    return branch.shorthand()
  }
}
