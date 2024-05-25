import * as NodeGit from 'nodegit'
import RepositoryDelegate from '@/objects/repository/RepositoryDelegate'
import RepositoryPatch from '@/objects/repository/RepositoryPatch'

async function AsyncIterableArray<T> (iterator: AsyncIterable<T>): Promise<T[]> {
  const collection: T[] = []
  for await (const item of iterator) {
    collection.push(item)
  }

  return collection
}

export default class RepositoryComparatorDelegate extends RepositoryDelegate {
  async diff_commit (oid) {
    await this.repository.refreshIndex()

    const commit = await this.repository.getCommit(oid)
    const commit_tree = await commit.getTree()

    const [ parent ] = await commit.getParents(1)
    const parent_tree = await parent.getTree()

    const diff = await commit_tree.diff(parent_tree)

    const patches = await AsyncIterableArray(RepositoryPatch.compile(diff))
    const message = commit.message()

    return { patches, message }
  }

  async diff_path (path) {
    const head = await this.repository.getBranchCommit(await this.repository.head())
    const tree = await head.getTree()

    const options: NodeGit.DiffOptions = {
      pathspec: path,
      flags: NodeGit.Diff.OPTION.DISABLE_PATHSPEC_MATCH
      + NodeGit.Diff.OPTION.INCLUDE_UNREADABLE
      + NodeGit.Diff.OPTION.INCLUDE_UNTRACKED
      + NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
      + NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT,
    }

    const diff = await NodeGit.Diff.treeToWorkdir(this.repository, tree, options)

    const patches = await AsyncIterableArray(RepositoryPatch.compile(diff))
    return { patches }
  }
}
