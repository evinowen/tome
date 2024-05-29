import * as NodeGit from 'nodegit'
import * as node_path from 'node:path'
import * as node_fs from 'node:fs'
import RepositoryCredentials from '@/objects/repository/RepositoryCredentials'
import RepositoryBranchDelegate from '@/objects/repository/delegates/RepositoryBranchDelegate'
import RepositoryCommitterDelegate from '@/objects/repository/delegates/RepositoryCommitterDelegate'
import RepositoryComparatorDelegate from '@/objects/repository/delegates/RepositoryComparatorDelegate'
import RepositoryHistoryDelegate from '@/objects/repository/delegates/RepositoryHistoryDelegate'
import RepositoryInspectorDelegate from '@/objects/repository/delegates/RepositoryInspectorDelegate'
import RepositoryRemoteDelegate from '@/objects/repository/delegates/RepositoryRemoteDelegate'
import RepositoryTagsDelegate from '@/objects/repository/delegates/RepositoryTagsDelegate'

import {
  RepositoryInaccessableError,
  RepositoryHeadDetachedError,
  RepositoryMergingError,
  RepositoryRebasingError,
} from '@/objects/repository/RepositoryErrors'

export default class RepositoryManager {
  path: string
  name: string

  repository: NodeGit.Repository

  credentials = new RepositoryCredentials()

  branch: RepositoryBranchDelegate
  comparator: RepositoryComparatorDelegate
  committer: RepositoryCommitterDelegate
  history: RepositoryHistoryDelegate
  inspector: RepositoryInspectorDelegate
  remotes: RepositoryRemoteDelegate
  tags: RepositoryTagsDelegate

  static async create (path) {
    const instance = new RepositoryManager()

    instance.path = path
    instance.name = node_path.basename(path)
    instance.repository = await RepositoryManager.open(path)
    instance.validate()

    instance.history = new RepositoryHistoryDelegate(instance.repository)

    instance.remotes = new RepositoryRemoteDelegate(instance.repository)
    instance.remotes.credential = () => instance.credentials
    await instance.remotes.load()

    instance.branch = new RepositoryBranchDelegate(instance.repository)
    instance.tags = new RepositoryTagsDelegate(instance.repository)
    instance.inspector = new RepositoryInspectorDelegate(instance.repository)
    instance.comparator = new RepositoryComparatorDelegate(instance.repository)

    instance.committer = new RepositoryCommitterDelegate(instance.repository)
    instance.committer.inspector = instance.inspector

    return instance
  }

  static async open (path) {
    let exists = false
    try {
      const git_path = node_path.join(path, '.git')
      await node_fs.promises.access(git_path)
      exists = true
    } catch { /* Empty */ }

    return exists
      ? await NodeGit.Repository.open(path)
      : await NodeGit.Repository.init(path, 0)
  }

  validate () {
    if (!this.repository) {
      throw new RepositoryInaccessableError()
    }

    if (this.repository.headDetached()) {
      throw new RepositoryHeadDetachedError()
    }

    if (this.repository.isMerging()) {
      throw new RepositoryMergingError()
    }

    if (this.repository.isRebasing()) {
      throw new RepositoryRebasingError()
    }
  }
}
