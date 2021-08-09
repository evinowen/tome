import { remote } from 'electron'
import NodeGit from 'nodegit'
import RepositoryFile from './RepositoryFile'
import RepositoryPatch from './RepositoryPatch'

export default class Repository {
  constructor (path) {
    this._ = {
      fs: remote.require('fs'),
      path: remote.require('path')
    }

    this.path = path
    this.name = this._.path.basename(this.path)

    this.repository = null
    this.branch = null

    this.remotes = null
    this.remote = null

    this.ahead = false
    this.pending = []

    this.available = []
    this.staged = []

    this.private_key = null
    this.public_key = null
    this.passphrase = null

    this.patches = null
  }

  storeCredentials (private_key, public_key, passphrase) {
    this.private_key = private_key
    this.public_key = public_key
    this.passphrase = passphrase
  }

  generateConnectionHooks () {
    const credentials = {
      private_key: this.private_key,
      public_key: this.public_key,
      passphrase: this.passphrase
    }

    return {
      credentials: function (url, username) {
        return NodeGit.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase)
      },
      certificateCheck: () => 0
    }
  }

  async load () {
    await this.loadOpenOrInit()

    this.validateRepositoryCondition()

    await this.loadHistory()

    await this.loadRemotes()

    await this.loadBranch()
  }

  async loadOpenOrInit () {
    const path = this._.path.join(this.path, '.git')

    if (this._.fs.existsSync(path)) {
      this.repository = await NodeGit.Repository.open(this.path)
    } else {
      this.repository = await NodeGit.Repository.init(this.path, 0)
    }
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
    let commit = await this.repository.getBranchCommit(await this.repository.head())

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
    const list = await this.repository.getRemotes()

    this.remotes = list.map(remote => ({
      name: remote.name(),
      url: remote.url(),
      object: remote
    }))
  }

  async loadBranch () {
    if (this.repository.headUnborn()) {
      this.loadUnbornBranch()
    } else {
      await this.loadBornBranch()
    }
  }

  loadUnbornBranch () {
    const head_path = this._.path.join(this.path, '.git', 'HEAD')
    const head_raw = this._.fs.readFileSync(head_path, 'utf8')

    let head_line_index = head_raw.length

    const head_line_index_n = head_raw.indexOf('\n')
    const head_line_index_r = head_raw.indexOf('\r')

    if (head_line_index_n >= 0) {
      head_line_index = Math.min(head_line_index_n, head_line_index)
    }

    if (head_line_index_r >= 0) {
      head_line_index = Math.min(head_line_index_r, head_line_index)
    }

    const head_trimmed = head_raw.substring(0, head_line_index)

    const head_parsed = head_trimmed.match(/^ref: refs\/heads\/(.*)$/m)

    if (head_parsed) {
      this.branch = head_parsed[1]
    }
  }

  async loadBornBranch () {
    const branch = await this.repository.head()
    this.branch = branch.shorthand()
  }

  async loadRemoteBranch (url) {
    this.remote = this.remotes.find(remote => remote.url === url)

    this.pending = []

    await this.remote.object.connect(NodeGit.Enums.DIRECTION.FETCH, this.generateConnectionHooks())

    const references = await this.remote.object.referenceList()

    this.remote.branch = this.matchRemoteBranchReference(references)

    let local_commit = await this.repository.getReferenceCommit(this.branch)
    const remote_commit = await this.repository.getCommit(this.remote.branch.object.oid())

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

  matchRemoteBranchReference (references) {
    let result

    references.forEach(reference => {
      const object = {
        name: reference.name(),
        object: reference
      }

      const parsed = reference.name().match(/^refs\/heads\/(.*)$/m)

      if (parsed) {
        object.short = parsed[1]

        if (object.short === this.branch) {
          result = object
        }
      }
    })

    return result
  }

  async inspect () {
    return Promise.all([
      this.inspectAvailable(), this.inspectStaged()
    ])
  }

  async inspectStaged () {
    const options = new NodeGit.StatusOptions()
    options.show = NodeGit.Status.SHOW.INDEX_ONLY

    this.staged = await this.inspectWithOptions(options)
  }

  async inspectAvailable () {
    const options = new NodeGit.StatusOptions()

    options.show = NodeGit.Status.SHOW.WORKDIR_ONLY
    options.flags = NodeGit.Status.OPT.INCLUDE_UNTRACKED + NodeGit.Status.OPT.RECURSE_UNTRACKED_DIRS

    this.available = await this.inspectWithOptions(options)
  }

  async inspectWithOptions (options) {
    return this.repository.getStatus(options)
      .then(res => res.map(status => {
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
    await this.repository.refreshIndex()

    const commit = await this.repository.getCommit(oid)
    const commit_tree = await commit.getTree()

    const [parent] = await commit.getParents(1)
    const parent_tree = await parent.getTree()

    const diff = await commit_tree.diff(parent_tree)

    await this.compilePatchesFromDiff(diff)
  }

  async diffPath (path) {
    const head = await this.repository.getBranchCommit(await this.repository.head())
    const tree = await head.getTree()

    const options = new NodeGit.DiffOptions()

    options.pathspec = path
    options.flags += NodeGit.Diff.OPTION.DISABLE_PATHSPEC_MATCH
    options.flags += NodeGit.Diff.OPTION.INCLUDE_UNREADABLE
    options.flags += NodeGit.Diff.OPTION.INCLUDE_UNTRACKED
    options.flags += NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
    options.flags += NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT

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

  async stage (query, notify) {
    const index = await this.repository.refreshIndex()

    if (query === '*') {
      for (let i = 0; i < this.available.length; i++) {
        await this.stagePath(index, this.available[i].path, notify)
      }
    } else {
      await this.stagePath(index, query, notify)
    }

    await index.write()
  }

  async stagePath (index, path, notify) {
    const absolute_path = this._.path.join(this.path, path)

    if (this._.fs.existsSync(absolute_path)) {
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

  async reset (query, notify) {
    const index = await this.repository.refreshIndex()
    const head = await this.repository.getBranchCommit(await this.repository.head())

    if (query === '*') {
      for (let i = 0; i < this.staged.length; i++) {
        await this.resetPath(index, this.staged[i].path, notify)
      }
    } else {
      await this.resetPath(head, query, notify)
    }

    await index.write()
  }

  async resetPath (head, path, notify) {
    if (notify) {
      notify('reset', path)
    }

    await NodeGit.Reset.default(this.repository, head, path)
  }

  async commit (name, email, message) {
    const index = await this.repository.refreshIndex()
    const oid = await index.writeTree()
    const parents = []

    if (!this.repository.headUnborn()) {
      const head = await NodeGit.Reference.nameToId(this.repository, 'HEAD')
      const parent = await this.repository.getCommit(head)

      parents.push(parent)
    }

    const signature = NodeGit.Signature.now(name, email)

    return this.repository.createCommit('HEAD', signature, signature, message, oid, parents)
  }

  async push () {
    if (this.remote) {
      const refspec = `refs/heads/${this.branch}:refs/heads/${this.branch}`
      const options = {
        callbacks: this.generateConnectionHooks()
      }

      await this.remote.object.push([refspec], options)
    }
  }
}
