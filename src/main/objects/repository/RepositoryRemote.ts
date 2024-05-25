import * as NodeGit from 'nodegit'
import RepositoryCredentials from './RepositoryCredentials'

interface NodeGitRemoteHead {
  name(): string
  oid(): NodeGit.Oid
}

export interface RepositoryRemoteSimple {
  name: string
  url: string
}

export interface RepositoryRemoteBranch {
  name: string
  short: string
  object: NodeGitRemoteHead
}

export default class RepositoryRemote {
  static regex_head = /^refs\/heads\/(.*)$/m

  credential: () => RepositoryCredentials
  simple?: RepositoryRemoteSimple
  object?: NodeGit.Remote
  branch: RepositoryRemoteBranch

  ahead = false
  pending: { oid: string, date: Date, message: string }[] = []

  constructor (credential: () => RepositoryCredentials) {
    this.credential = credential
  }

  async select_branch (branch: string) {
    this.branch = await this.match_branch(branch)

    const { ahead, diff } = await this.diff_reference(branch)
    this.ahead = ahead
    this.pending = diff
  }

  async match_branch (branch: string) {
    const references = await this.fetch_references()

    for (const reference of references) {
      const result = RepositoryRemote.regex_head.exec(reference.name())

      if (result === null) {
        continue
      }

      if (result[1] !== branch) {
        continue
      }

      return {
        name: reference.name(),
        short: result[1],
        object: reference,
      }
    }
  }

  async fetch_references () {
    await this.object.connect(NodeGit.Enums.DIRECTION.FETCH, this.credential().callbacks())
    return (await this.object.referenceList()) as NodeGitRemoteHead[]
  }

  async diff_reference (reference: string | NodeGit.Reference) {
    let ahead = false
    const diff = []

    const repository = this.object.owner()

    const head_commit = this.branch ? await repository.getCommit(this.branch.object.oid()) : undefined
    let reference_commit = await repository.getReferenceCommit(reference)
    do {
      const reference_commit_id = reference_commit.id()
      if (head_commit && head_commit.id().cmp(reference_commit_id) === 0) {
        break
      }

      ahead = true
      diff.push({
        oid: reference_commit_id.tostrS(),
        date: reference_commit.date(),
        message: reference_commit.message(),
      })

      try {
        reference_commit = await reference_commit.parent(0)
      } catch {
        break
      }
    } while (reference_commit)

    return { ahead, diff }
  }

  async push () {
    const refspec = `refs/heads/${this.branch.short}:refs/heads/${this.branch.short}`
    const options = {
      callbacks: this.credential().callbacks(),
    }

    await this.object.push([ refspec ], options)
  }
}
