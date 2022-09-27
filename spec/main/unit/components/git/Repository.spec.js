const Repository = require('@/components/git/Repository')
const fs = require('fs')
const path = require('path')
const NodeGit = require('nodegit')

jest.mock('@/components/git/RepositoryPatch')

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

jest.mock('fs', () => ({
  readFileSync: jest.fn((target, options) => 'ref: refs/heads/master\r\ndata\r\ndata\r\n'),
  existsSync: jest.fn((target) => true)
}))

jest.mock('path', () => ({
  basename: jest.fn((target) => String(target).slice(String(target).lastIndexOf('/') + 1)),
  join: jest.fn((first, second) => String(first).replace(/\/$/g, '').concat('/').concat(String(second).replace(/^\/|\/$/g, '')))
}))

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {}, Diff: { LINE: 1 } }))

const nodegit_references = [
  {
    name: jest.fn(() => 'refs/heads/master'),
    oid: jest.fn()
  }
]

const nodegit_remote = {
  name: jest.fn(() => ''),
  url: jest.fn(() => 'git@git.example.com:remote.git'),
  connect: jest.fn(),
  referenceList: jest.fn(() => nodegit_references),
  push: jest.fn()
}

const nodegit_remotes = [
  nodegit_remote
]

const nodegit_branch = {
  shorthand: jest.fn(() => 'master')
}

const nodegit_tree = {
  diff: jest.fn(() => nodegit_diff)
}

const nodegit_commit_id = {
  cmp: jest.fn(() => 0),
  tostrS: jest.fn(() => '1234')
}

const nodegit_commit = {
  id: jest.fn(() => nodegit_commit_id),
  date: jest.fn(),
  message: jest.fn(() => 'Commit Message'),
  parentcount: jest.fn(() => 0),
  parent: jest.fn(() => null),
  getParents: jest.fn(() => [nodegit_commit]),
  getTree: jest.fn(() => nodegit_tree)
}

const nodegit_repository_index = {
  addByPath: jest.fn(),
  removeByPath: jest.fn(),
  write: jest.fn(),
  writeTree: jest.fn()
}

const nodegit_repository_status = [
  {
    path: jest.fn(() => './first_file'),
    isNew: jest.fn(() => true),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => false)
  },
  {
    path: jest.fn(() => './second_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => true),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => false)
  },
  {
    path: jest.fn(() => './third_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => true),
    isDeleted: jest.fn(() => false)
  },
  {
    path: jest.fn(() => './fourth_file'),
    isNew: jest.fn(() => false),
    isModified: jest.fn(() => false),
    isRenamed: jest.fn(() => false),
    isDeleted: jest.fn(() => true)
  }
]

const nodegit_repository = {
  headDetached: jest.fn(),
  headUnborn: jest.fn(),
  isMerging: jest.fn(),
  isRebasing: jest.fn(),
  head: jest.fn(() => nodegit_branch),
  createCommit: jest.fn(),
  getCommit: jest.fn(() => nodegit_commit),
  getBranchCommit: jest.fn(() => nodegit_commit),
  getReferenceCommit: jest.fn(() => nodegit_commit),
  getRemotes: jest.fn(() => nodegit_remotes),
  getStatus: jest.fn(() => Promise.resolve(nodegit_repository_status)),
  refreshIndex: jest.fn(() => nodegit_repository_index)
}

const nodegit_patches = [{}, {}, {}]

const nodegit_diff = {
  patches: jest.fn(() => nodegit_patches)
}

NodeGit.Credential = {
  sshKeyNew: jest.fn((username, public_key, private_key, passphrase) => ({
    username, public_key, private_key, passphrase
  }))
}

NodeGit.DiffOptions = jest.fn()

NodeGit.Diff = {
  treeToWorkdir: jest.fn(() => nodegit_diff),
  OPTION: {
    DISABLE_PATHSPEC_MATCH: 0,
    INCLUDE_UNREADABLE: 0,
    INCLUDE_UNTRACKED: 0,
    RECURSE_UNTRACKED_DIRS: 0
  }
}

NodeGit.Enums = {
  DIRECTION: {
    FETCH: 0
  }
}

NodeGit.Reference = {
  nameToId: jest.fn(() => nodegit_branch)
}

NodeGit.Repository = {
  open: jest.fn((path) => nodegit_repository),
  init: jest.fn((path, is_bare) => nodegit_repository)
}

NodeGit.Reset = {
  default: jest.fn()
}

NodeGit.Signature = {
  now: jest.fn(() => ({}))
}

NodeGit.StatusOptions = jest.fn()

NodeGit.Status = {
  SHOW: {
    INDEX_AND_WORKDIR: 0,
    INDEX_ONLY: 1,
    WORKDIR_ONLY: 2
  },
  OPT: {
    INCLUDE_UNTRACKED: 1,
    INCLUDE_IGNORED: 2,
    INCLUDE_UNMODIFIED: 4,
    EXCLUDE_SUBMODULES: 8,
    RECURSE_UNTRACKED_DIRS: 16,
    DISABLE_PATHSPEC_MATCH: 32,
    RECURSE_IGNORED_DIRS: 64,
    RENAMES_HEAD_TO_INDEX: 128,
    RENAMES_INDEX_TO_WORKDIR: 256,
    SORT_CASE_SENSITIVELY: 512,
    SORT_CASE_INSENSITIVELY: 1024,
    RENAMES_FROM_REWRITES: 2048,
    NO_REFRESH: 4096,
    UPDATE_INDEX: 8192,
    INCLUDE_UNREADABLE: 16_384,
    INCLUDE_UNREADABLE_AS_UNTRACKED: 32_768
  }
}

describe('Repository.js', () => {
  beforeEach(() => {

  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initalize member variables on construction', async () => {
    const target = './test_path'
    const name = path.basename(target)

    const repository = new Repository(target)

    expect(repository.path).toEqual(target)
    expect(repository.name).toEqual(name)

    expect(repository.repository).toEqual(null)
    expect(repository.branch).toEqual(null)

    expect(repository.remotes).toEqual(null)
    expect(repository.remote).toEqual(null)

    expect(repository.ahead).toEqual(false)
    expect(repository.pending).toEqual([])

    expect(repository.available).toEqual([])
    expect(repository.staged).toEqual([])

    expect(repository.private_key).toEqual(null)
    expect(repository.public_key).toEqual(null)
    expect(repository.passphrase).toEqual(null)

    expect(repository.patches).toEqual(null)
  })

  it('should remember credentials set by storeCredentials', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository = new Repository(target)
    repository.storeCredentials(private_key, public_key, passphrase)

    expect(repository.private_key).toEqual('./test_rsa')
    expect(repository.public_key).toEqual('./test_rsa.pub')
    expect(repository.passphrase).toEqual('1234')
  })

  it('should return callbacks object for NodeGit on call to generateConnectionHooks ', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'
    const url = 'git@git.example.com:remote.git'
    const username = 'git'

    const repository = new Repository(target)
    repository.storeCredentials(private_key, public_key, passphrase)
    const hooks = await repository.generateConnectionHooks()

    const credentials = await hooks.credentials(url, username)
    const certificate_check = await hooks.certificateCheck()

    expect(credentials.username).toEqual(username)
    expect(credentials.private_key).toEqual(private_key)
    expect(credentials.public_key).toEqual(public_key)
    expect(credentials.passphrase).toEqual(passphrase)
    expect(certificate_check).toEqual(0)
  })

  it('should cycle through load process on call to load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    const target = './test_path'

    const repository = new Repository(target)
    repository.loadOpenOrInit = jest.fn()
    repository.validateRepositoryCondition = jest.fn()
    repository.loadHistory = jest.fn()
    repository.loadRemotes = jest.fn()
    repository.loadBranch = jest.fn()

    await repository.load()

    expect(repository.loadOpenOrInit).toHaveBeenCalledTimes(1)
    expect(repository.validateRepositoryCondition).toHaveBeenCalledTimes(1)
    expect(repository.loadHistory).toHaveBeenCalledTimes(1)
    expect(repository.loadRemotes).toHaveBeenCalledTimes(1)
    expect(repository.loadBranch).toHaveBeenCalledTimes(1)
  })

  it('should complete load process on call to load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()

    expect(repository.repository).not.toBeNull()
  })

  it('should throw Error if repository is not set on attempt to load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    NodeGit.Repository.open.mockReturnValueOnce(null)

    const target = './test_path'

    expect.assertions(1)

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('No Repository!')
    }
  })

  it('should throw Error if loaded repository has detached head during load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    nodegit_repository.headDetached.mockRejectedValueOnce(true)

    const target = './test_path'

    expect.assertions(1)

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Head Detached')
    }
  })

  it('should throw Error if loaded repository is merging during load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    nodegit_repository.isMerging.mockRejectedValueOnce(true)

    const target = './test_path'

    expect.assertions(1)

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Merging')
    }
  })

  it('should throw Error if loaded repository is rebasing during load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    nodegit_repository.isRebasing.mockRejectedValueOnce(true)

    const target = './test_path'

    expect.assertions(1)

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Rebasing')
    }
  })

  it('should cycle through load process even when head unborn on call to load', async () => {
    nodegit_commit.parentcount.mockReturnValueOnce(1)
    nodegit_commit.parent.mockReturnValueOnce(nodegit_commit)

    nodegit_repository.headUnborn.mockReturnValueOnce(true)

    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()

    expect(repository.repository).not.toBeNull()
  })

  it('should load and compare remote branch identified by url on call to loadRemoteBranch', async () => {
    nodegit_commit_id.cmp.mockReturnValueOnce(1)
    nodegit_commit.parentcount.mockReturnValue(1)
    nodegit_commit.parent.mockReturnValue(nodegit_commit)

    const target = './test_path'
    const url = 'git@git.example.com:remote.git'

    const repository = new Repository(target)
    await repository.load()
    await repository.loadRemoteBranch(url)

    expect(repository.remote).not.toBeNull()
    expect(repository.remote.branch).not.toBeNull()
  })

  it('should call and wait inspectStaged and inspectAvailable on inspect', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectStaged = jest.fn()
    repository.inspectAvailable = jest.fn()

    await repository.load()
    await repository.inspect()

    expect(repository.inspectStaged).toHaveBeenCalledTimes(1)
    expect(repository.inspectAvailable).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect stage to inspectWithOptions on call to inspectStage', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectWithOptions = jest.fn()

    await repository.load()
    await repository.inspectStaged()

    expect(repository.inspectWithOptions).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect available to inspectWithOptions on call to inspectAvailable ', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectWithOptions = jest.fn()

    await repository.load()
    await repository.inspectAvailable()

    expect(repository.inspectWithOptions).toHaveBeenCalledTimes(1)
  })

  it('should load status of files updated based on options on call to inspectWithOptions ', async () => {
    const target = './test_path'
    const options = {}

    const repository = new Repository(target)

    await repository.load()
    await repository.inspectWithOptions(options)

    expect(nodegit_repository.getStatus).toHaveBeenCalledTimes(1)
  })

  it('should retrieve NodeGit diff for commit OID and pass to compilePatchesFromDiff on call to diffCommit', async () => {
    const target = './test_path'
    const oid = '1234'

    const repository = new Repository(target)
    repository.compilePatchesFromDiff = jest.fn()

    await repository.load()
    await repository.diffCommit(oid)

    expect(repository.compilePatchesFromDiff).toHaveBeenCalledTimes(1)
  })

  it('should retrieve NodeGit diff for a path and pass to compilePatchesFromDiff on call to diffPath ', async () => {
    const target = './test_path'
    const file_target = './test_path/file.md'

    const repository = new Repository(target)
    repository.compilePatchesFromDiff = jest.fn()

    await repository.load()
    await repository.diffPath(file_target)

    expect(repository.compilePatchesFromDiff).toHaveBeenCalledTimes(1)
  })

  it('should load NodeGit patches into RepositoryPatch objects and store on call to compilePatchesFromDiff', async () => {
    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()

    await repository.compilePatchesFromDiff(nodegit_diff)

    expect(repository.patches).not.toBeNull()
    expect(repository.patches.length).toBeGreaterThanOrEqual(0)
  })

  it('should stage all available files with stagePath when query is "*" on call to stage', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.stagePath = jest.fn()

    await repository.load()

    repository.available = [
      { path: './test_path/first_file.md' },
      { path: './test_path/second_file.md' },
      { path: './test_path/third_file.md' }
    ]

    await repository.stage('*')

    expect(repository.stagePath).toHaveBeenCalledTimes(3)
  })

  it('should stage provided path add with stagePath when query is a path on call to stage', async () => {
    const target = './test_path'
    const file_target = './test_path/file.md'

    const repository = new Repository(target)

    const notify = jest.fn()

    await repository.load()
    await repository.stage(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(nodegit_repository_index.addByPath).toHaveBeenCalledTimes(1)
  })

  it('should stage provided path remove with stagePath when query is a path on call to stage', async () => {
    const target = './test_path'
    const file_target = './test_path/file.md'

    fs.existsSync.mockReturnValue(false)

    const repository = new Repository(target)

    const notify = jest.fn()

    await repository.load()
    await repository.stage(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(nodegit_repository_index.removeByPath).toHaveBeenCalledTimes(1)
  })

  it('should reset all staged files with resetPath when query is "*" on call to reset', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.resetPath = jest.fn()

    await repository.load()

    repository.staged = [
      { path: './test_path/first_file.md' },
      { path: './test_path/second_file.md' },
      { path: './test_path/third_file.md' }
    ]

    await repository.reset('*')

    expect(repository.resetPath).toHaveBeenCalledTimes(3)
  })

  it('should reset provided path with resetPath when query is a path on call to reset', async () => {
    const target = './test_path'
    const file_target = './test_path/file.md'

    const repository = new Repository(target)

    const notify = jest.fn()

    await repository.load()
    await repository.reset(file_target, notify)

    expect(notify).toHaveBeenCalledTimes(1)
    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(1)
  })

  it('should create a commit with provided information on call to commit', async () => {
    const target = './test_path'
    const name = 'Test Name'
    const email = 'text@example.com'
    const message = 'Test Commit Message'

    const repository = new Repository(target)

    await repository.load()
    await repository.commit(name, email, message)

    expect(nodegit_repository.createCommit).toHaveBeenCalledTimes(1)
  })

  it('should fail to push if no remote is loaded on call to push', async () => {
    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()
    await repository.push()

    expect(nodegit_remote.push).toHaveBeenCalledTimes(0)
  })

  it('should push current branch to the loaded remote on call to push', async () => {
    const target = './test_path'
    const url = 'git@git.example.com:remote.git'

    const repository = new Repository(target)

    await repository.load()
    await repository.loadRemoteBranch(url)
    await repository.push()

    expect(nodegit_remote.push).toHaveBeenCalledTimes(1)
  })
})
