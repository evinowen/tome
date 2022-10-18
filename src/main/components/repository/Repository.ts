import * as NodeGit from 'nodegit'
import * as _path from 'node:path'
import * as _fs from 'node:fs'
import RepositoryFile from './RepositoryFile'
import RepositoryPatch from './RepositoryPatch'

interface NodeGitRemoteHead {
  oid(): NodeGit.Oid
}

class RepositoryNotLoadedError extends Error {}
class RepositoryBranchNotSelectedError extends Error {}
class RepositoryRemoteNotLoadedError extends Error {}
class RepositoryRemoteNotFoundError extends Error {}

class RepositoryPublicKeyNotSetError extends Error {}
class RepositoryPrivateKeyNotSetError extends Error {}

export default class Repository {
  path: string
  name: string
  branch: string|undefined = undefined

  repository: NodeGit.Repository|undefined = undefined

  private_key: string|undefined = undefined
  public_key: string|undefined = undefined
  passphrase: string|undefined = undefined

  ahead = false
  remote: { name: string, url: string }|undefined = undefined
  remote_branch: { name: string, short: string, object: NodeGitRemoteHead }|undefined = undefined
  remotes: { name: string, url: string }[] = []
  remote_map: Map<string, NodeGit.Remote>|undefined = undefined
  remote_object: NodeGit.Remote|undefined = undefined

  patches: RepositoryPatch[] = []
  available: RepositoryFile[] = []
  staged: RepositoryFile[] = []

  pending:{ oid: string, date: Date, message: string }[] = []
  history:{ oid: string, date: Date, message: string }[] = []

  constructor (path) {
    this.path = path
    this.name = _path.basename(this.path)

    this.clearBranch()
    this.clearRemoteBranch()
  }

  storeCredentials (private_key, public_key, passphrase) {
    this.private_key = private_key
    this.public_key = public_key
    this.passphrase = passphrase
  }

  generateConnectionHooks (): NodeGit.RemoteCallbacks {

    const hooks:NodeGit.RemoteCallbacks = {
      certificateCheck: () => 0
    }

    if (this.private_key === undefined) {
      throw new RepositoryPrivateKeyNotSetError()
    }

    if (this.public_key === undefined) {
      throw new RepositoryPublicKeyNotSetError()
    }

    const credentials = {
      private_key: this.private_key,
      public_key: this.public_key,
      passphrase: this.passphrase || ''
    }

    let attempts = 10
    hooks.credentials = function (url, username) {
      if (credentials.private_key) {
        if (!attempts--) {
          throw new Error('hook.certificateCheck_break exceeded')
        }

        return NodeGit.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase)
      }
    }

    return hooks
  }

  async load () {
    await this.loadOpenOrInit()

    this.validateRepositoryCondition()

    await this.loadHistory()

    await this.loadRemotes()

    await this.loadBranch()
  }

  async loadOpenOrInit () {
    const path = _path.join(this.path, '.git')

    _fs.existsSync(path)
      ? this.repository = await NodeGit.Repository.open(this.path)
      : this.repository = await NodeGit.Repository.init(this.path, 0)
  }

  validateRepositoryCondition () {
    if (!this.repository) {
      throw new Error('No Repository!')
    }

    if (this.repository.headDetached()) {
      throw new Error('Head Detached')
    }

    if (this.repository.isMerging()) {
      throw new Error('Merging')
    }

    if (this.repository.isRebasing()) {
      throw new Error('Rebasing')
    }
  }

  async loadHistory () {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    let commit

    try {
      const head = await this.repository.head()

      commit = await this.repository.getBranchCommit(head)
    } catch {
      return
    }

    this.history = []

    for (let limit = 20; commit && limit > 0; limit--) {
      this.history.push({
        oid: commit.id().tostrS(),
        date: commit.date(),
        message: commit.message()
      })

      if (commit.parentcount()) {
        commit = await commit.parent(0)
      } else {
        break
      }
    }
  }

  async loadRemotes () {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const list = await this.repository.getRemotes()

    this.remotes = list.map(remote => ({
      name: remote.name(),
      url: remote.url()
    }))

    this.remote_map = new Map()
    for (const remote of list) {
      this.remote_map[remote.name()] = remote
    }
  }

  clearBranch () {
    this.branch = undefined
  }

  async loadBranch () {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    if (this.repository.headUnborn()) {
      this.loadUnbornBranch()
    } else {
      await this.loadBornBranch()
    }
  }

  loadUnbornBranch () {
    const head_path = _path.join(this.path, '.git', 'HEAD')
    const head_raw = _fs.readFileSync(head_path, 'utf8')

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

    const head_parsed = head_trimmed.match(/^ref: refs\/heads\/(.*)$/m)

    if (head_parsed) {
      this.branch = head_parsed[1]
    }
  }

  async loadBornBranch () {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const branch = await this.repository.head()
    this.branch = branch.shorthand()
  }

  async loadRemoteBranch (url) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    if (this.branch === undefined) {
      throw new RepositoryBranchNotSelectedError()
    }

    this.clearRemoteBranch()

    this.remote = this.remotes.find(remote => remote.url === url) || undefined

    if (this.remote === undefined) {
      throw new RepositoryRemoteNotFoundError()
    }

    if (this.remote_map === undefined) {
      throw new RepositoryRemoteNotLoadedError()
    }

    this.remote_object = this.remote_map[this.remote.name]

    if (this.remote_object === undefined) {
      throw new RepositoryRemoteNotLoadedError()
    }

    await this.remote_object.connect(NodeGit.Enums.DIRECTION.FETCH, this.generateConnectionHooks())

    const references = await this.remote_object.referenceList()

    this.remote_branch = this.matchRemoteBranchReference(references)
    // this.remote.branch = {
    //   name: this.remote_branch.name,
    //   short: this.remote_branch.short
    // }

    let local_commit = await this.repository.getReferenceCommit(this.branch)
    const remote_commit = await this.repository.getCommit(this.remote_branch.object.oid())

    this.ahead = false

    do {
      if (remote_commit.id().cmp(local_commit.id()) === 0) {
        break
      }

      this.pending.push({
        oid: local_commit.id().tostrS(),
        date: local_commit.date(),
        message: local_commit.message()
      })

      this.ahead = true

      local_commit = await local_commit.parent(0)
    } while (local_commit)
  }

  clearRemoteBranch () {
    this.remote = undefined
    this.remote_object = undefined
    this.remote_branch = undefined

    this.pending = []
  }

  matchRemoteBranchReference (references) {
    let result: { name: string, short: string, object: NodeGitRemoteHead }|undefined

    for (const reference of references) {
      const object: { name: string, short: string, object: NodeGitRemoteHead } = {
        name: reference.name(),
        short: '',
        object: reference
      }

      const parsed = reference.name().match(/^refs\/heads\/(.*)$/m)

      if (parsed) {
        object.short = parsed[1]

        if (object.short === this.branch) {
          result = object
        }
      }
    }

    return result
  }

  async inspect () {
    return Promise.all([
      this.inspectAvailable(), this.inspectStaged()
    ])
  }

  async inspectStaged () {
    const options:NodeGit.StatusOptions = {
      show: NodeGit.Status.SHOW.INDEX_ONLY
    }

    this.staged = await this.inspectWithOptions(options)
  }

  async inspectAvailable () {
    const options:NodeGit.StatusOptions = {
      show: NodeGit.Status.SHOW.WORKDIR_ONLY,
      flags: NodeGit.Status.OPT.INCLUDE_UNTRACKED + NodeGit.Status.OPT.RECURSE_UNTRACKED_DIRS
    }

    this.available = await this.inspectWithOptions(options)
  }

  async inspectWithOptions (options) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    return this.repository.getStatus(options)
      .then(result => result.map(status => {
        let type = RepositoryFile.Type.UNKNOWN

        if (status.isNew()) {
          type = RepositoryFile.Type.NEW
        } else if (status.isModified()) {
          type = RepositoryFile.Type.MODIFIED
        } else if (status.isRenamed()) {
          type = RepositoryFile.Type.RENAMED
        } else if (status.isDeleted()) {
          type = RepositoryFile.Type.DELETED
        }

        return new RepositoryFile(status.path(), type)
      }))
  }

  async diffCommit (oid) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    await this.repository.refreshIndex()

    const commit = await this.repository.getCommit(oid)
    const commit_tree = await commit.getTree()

    const [parent] = await commit.getParents(1)
    const parent_tree = await parent.getTree()

    const diff = await commit_tree.diff(parent_tree)

    await this.compilePatchesFromDiff(diff)
  }

  async diffPath (path) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const head = await this.repository.getBranchCommit(await this.repository.head())
    const tree = await head.getTree()

    const options:NodeGit.DiffOptions = {
      pathspec: path,
      flags: NodeGit.Diff.OPTION.DISABLE_PATHSPEC_MATCH
        + NodeGit.Diff.OPTION.INCLUDE_UNREADABLE
        + NodeGit.Diff.OPTION.INCLUDE_UNTRACKED
        + NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
        + NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT
    }

    const diff = await NodeGit.Diff.treeToWorkdir(this.repository, tree, options)

    await this.compilePatchesFromDiff(diff)
  }

  async compilePatchesFromDiff (diff) {
    const patches = await diff.patches()

    this.patches = []
    for (const patch of patches) {
      const repository_patch = new RepositoryPatch()
      await repository_patch.build(patch)

      this.patches.push(repository_patch)
    }
  }

  async stage (query, notify?) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const repository_index = await this.repository.refreshIndex()

    if (query === '*') {
      for (let index = 0; index < this.available.length; index++) {
        await this.stagePath(repository_index, this.available[index].path, notify)
      }
    } else {
      await this.stagePath(repository_index, query, notify)
    }

    await repository_index.write()
  }

  async stagePath (index, path, notify) {
    const absolute_path = _path.join(this.path, path)

    if (_fs.existsSync(absolute_path)) {
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
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const index = await this.repository.refreshIndex()
    const head = await this.repository.getBranchCommit(await this.repository.head())

    if (query === '*') {
      for (let index = 0; index < this.staged.length; index++) {
        await this.resetPath(head, this.staged[index].path, notify)
      }
    } else {
      await this.resetPath(head, query, notify)
    }

    await index.write()
  }

  async resetPath (head, path, notify) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    if (notify) {
      notify('reset', path)
    }

    await NodeGit.Reset.default(this.repository, head, [path])
  }

  async commit (name, email, message) {
    if (this.repository === undefined) {
      throw new RepositoryNotLoadedError()
    }

    const index = await this.repository.refreshIndex()
    const oid = await index.writeTree()
    const parents:NodeGit.Commit[] = []

    if (!this.repository.headUnborn()) {
      const head = await NodeGit.Reference.nameToId(this.repository, 'HEAD')
      const parent = await this.repository.getCommit(head)

      parents.push(parent)
    }

    const signature = NodeGit.Signature.now(name, email)

    return this.repository.createCommit('HEAD', signature, signature, message, oid, parents)
  }

  async push () {
    if (this.remote === undefined) {
      throw new RepositoryRemoteNotLoadedError()
    }

    if (this.remote_object === undefined) {
      throw new RepositoryRemoteNotLoadedError()
    }

    const refspec = `refs/heads/${this.branch}:refs/heads/${this.branch}`
    const options = {
      callbacks: this.generateConnectionHooks()
    }

    await this.remote_object.push([refspec], options)
  }
}
