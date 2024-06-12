import * as node_fs from 'node:fs'
import * as node_path from 'node:path'
import * as NodeGit from 'nodegit'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'
import RepositoryInspectorDelegate from '@/objects/repository/delegates/RepositoryInspectorDelegate'

export default class RepositoryCommitterDelegate extends RepositoryDelegate {
  inspector: RepositoryInspectorDelegate

  async stage (query, notify?) {
    const repository_index = await this.repository.refreshIndex()

    query === '*'
      ? await this.stage_all(repository_index, notify)
      : await this.stage_path(repository_index, query, notify)

    await repository_index.write()
  }

  async stage_all (index, notify) {
    const available = await this.inspector.inspect_available()

    for (const file of available) {
      await this.stage_path(index, file.path, notify)
    }
  }

  async stage_path (index, path, notify) {
    const directory_path = node_path.dirname(this.repository.path())
    const absolute_path = node_path.join(directory_path, path)

    let exists = false
    try {
      await node_fs.promises.access(absolute_path)
      exists = true
    } catch { /* Empty */ }

    if (exists) {
      if (notify) {
        notify('add', path)
      }

      await index.addByPath(path)
    } else {
      if (notify) {
        notify('remove', path)
      }

      await index.removeByPath(path)
    }
  }

  async reset (query, notify?) {
    const index = await this.repository.refreshIndex()
    const head = await this.repository.getBranchCommit(await this.repository.head())

    query === '*'
      ? await this.reset_all(head, notify)
      : await this.reset_path(head, query, notify)

    await index.write()
  }

  async reset_all (head, notify) {
    const staged = await this.inspector.inspect_staged()

    for (const file of staged) {
      await this.reset_path(head, file.path, notify)
    }
  }

  async reset_path (head, path, notify) {
    if (notify) {
      notify('reset', path)
    }

    await NodeGit.Reset.default(this.repository, head, [ path ])
  }

  async commit (name, email, message) {
    const index = await this.repository.refreshIndex()
    const oid = await index.writeTree()
    const parents: NodeGit.Commit[] = []

    if (!this.repository.headUnborn()) {
      const head = await NodeGit.Reference.nameToId(this.repository, 'HEAD')
      const parent = await this.repository.getCommit(head)

      parents.push(parent)
    }

    const signature = NodeGit.Signature.now(name, email)

    return this.repository.createCommit('HEAD', signature, signature, message, oid, parents)
  }
}
