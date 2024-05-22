import { jest, describe, afterEach, it, expect } from '@jest/globals'
import Repository from '@/objects/Repository'
import RepositoryFile from '@/objects/RepositoryFile'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as NodeGit from 'nodegit'
import { mocked_commit, mocked_commit_id, mocked_diff, mocked_repository, mocked_repository_index } from '../../mocks/nodegit'

jest.mock('@/objects/RepositoryPatch')

jest.mock('electron', () => ({
  remote: {
    require: jest.fn(),
  },
}))

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => 'ref: refs/heads/master\r\ndata\r\ndata\r\n'),
  existsSync: jest.fn(() => true),
}))

jest.mock('node:path', () => ({
  basename: jest.fn((target) => String(target).slice(String(target).lastIndexOf('/') + 1)),
  join: jest.fn((first, second) => `${String(first).replaceAll(/\/$/g, '')}${String(second).replaceAll(/^\/|\/$/g, '')}`),
}))

jest.mock('nodegit')

function await_resolve<T> (value?: T) {
  return () => new Promise<T>((resolve) => resolve(value))
}

const mocked_fs = jest.mocked(fs)

describe('components/repository/Repository', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initalize member variables on construction', async () => {
    const target = './test_path'
    const name = path.basename(target)

    const repository = new Repository(target)

    expect(repository.path).toEqual(target)
    expect(repository.name).toEqual(name)

    expect(repository.repository).toBeUndefined()
    expect(repository.branch).toBeUndefined()

    expect(repository.remotes).toEqual([])
    expect(repository.remote).toBeUndefined()

    expect(repository.ahead).toEqual(false)
    expect(repository.pending).toEqual([])

    expect(repository.available).toEqual([])
    expect(repository.staged).toEqual([])

    expect(repository.credentials.type).toBeUndefined()
    expect(repository.credentials.username).toBeUndefined()
    expect(repository.credentials.password).toBeUndefined()
    expect(repository.credentials.private_key).toBeUndefined()
    expect(repository.credentials.public_key).toBeUndefined()
    expect(repository.credentials.passphrase).toBeUndefined()

    expect(repository.patches).toEqual([])
  })

  it('should remember credentials set by storePasswordCredentials', async () => {
    const target = './test_path'
    const username = 'username'
    const password = 'password'

    const repository = new Repository(target)
    repository.storePasswordCredentials(username, password)

    expect(repository.credentials.type).toEqual('password')
    expect(repository.credentials.username).toEqual(username)
    expect(repository.credentials.password).toEqual(password)
  })

  it('should remember credentials set by storeKeyCredentials', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)

    expect(repository.credentials.type).toEqual('key')
    expect(repository.credentials.private_key).toEqual(private_key)
    expect(repository.credentials.public_key).toEqual(public_key)
    expect(repository.credentials.passphrase).toEqual(passphrase)
  })

  it('should return callbacks object for NodeGit on call to generateConnectionHooks ', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'
    const url = 'git@git.example.com:remote.git'
    const username = 'git'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)
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
    const target = './test_path'

    const repository = new Repository(target)

    repository.loadOpenOrInit = jest.fn(await_resolve<void>())
    repository.validateRepositoryCondition = jest.fn()
    repository.loadHistory = jest.fn(await_resolve<void>())
    repository.loadRemotes = jest.fn(await_resolve<void>())
    repository.loadBranch = jest.fn(await_resolve<void>())

    await repository.load()

    expect(repository.loadOpenOrInit).toHaveBeenCalledTimes(1)
    expect(repository.validateRepositoryCondition).toHaveBeenCalledTimes(1)
    expect(repository.loadHistory).toHaveBeenCalledTimes(1)
    expect(repository.loadRemotes).toHaveBeenCalledTimes(1)
    expect(repository.loadBranch).toHaveBeenCalledTimes(1)
  })

  it('should complete load process on call to load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)

    await repository.load()

    expect(repository.repository).not.toBeUndefined()
  })

  it('should throw Error if repository is not set on attempt to load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    let repository
    const mocked_NodeGit_Repository = jest.mocked(NodeGit.Repository)
    mocked_NodeGit_Repository.open.mockReturnValueOnce(repository)

    const target = './test_path'

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('No Repository!')
    }
  })

  it('should throw Error if loaded repository has detached head during load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    mocked_repository.headDetached.mockReturnValueOnce(1)

    const target = './test_path'

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Head Detached')
    }
  })

  it('should throw Error if loaded repository is merging during load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    mocked_repository.isMerging.mockReturnValueOnce(true)

    const target = './test_path'

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Merging')
    }
  })

  it('should throw Error if loaded repository is rebasing during load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    mocked_repository.isRebasing.mockReturnValueOnce(true)

    const target = './test_path'

    try {
      const repository = new Repository(target)
      await repository.load()
    } catch (error) {
      expect(error.message).toEqual('Rebasing')
    }
  })

  it('should cycle through load process even when head unborn on call to load', async () => {
    mocked_commit.parentcount.mockReturnValueOnce(1)
    mocked_commit.parent.mockReturnValueOnce(mocked_commit)

    mocked_repository.headUnborn.mockReturnValueOnce(1)

    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()

    expect(repository.repository).not.toBeUndefined()
  })

  it('should load and compare remote branch identified by url on call to loadRemoteBranch', async () => {
    mocked_commit_id.cmp.mockReturnValueOnce(1)
    mocked_commit.parentcount.mockReturnValue(1)
    mocked_commit.parent.mockReturnValue(mocked_commit)

    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'
    const url = 'git@git.example.com:remote.git'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)

    await repository.load()
    await repository.loadRemoteBranch(url)

    expect(repository.remote).not.toBeUndefined()
  })

  it('should call and wait inspectStaged and inspectAvailable on inspect', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectStaged = jest.fn(await_resolve<void>())
    repository.inspectAvailable = jest.fn(await_resolve<void>())

    await repository.load()
    await repository.inspect()

    expect(repository.inspectStaged).toHaveBeenCalledTimes(1)
    expect(repository.inspectAvailable).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect stage to inspectWithOptions on call to inspectStage', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectWithOptions = jest.fn(await_resolve<RepositoryFile[]>([]))

    await repository.load()
    await repository.inspectStaged()

    expect(repository.inspectWithOptions).toHaveBeenCalledTimes(1)
  })

  it('should pass options to inspect available to inspectWithOptions on call to inspectAvailable ', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.inspectWithOptions = jest.fn(await_resolve<RepositoryFile[]>([]))

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

    expect(repository.repository.getStatus).toHaveBeenCalledTimes(1)
  })

  it('should retrieve NodeGit diff for commit OID and pass to compilePatchesFromDiff on call to diffCommit', async () => {
    const target = './test_path'
    const oid = '1234'

    const repository = new Repository(target)
    repository.compilePatchesFromDiff = jest.fn(await_resolve<void>())

    await repository.load()
    await repository.diffCommit(oid)

    expect(repository.compilePatchesFromDiff).toHaveBeenCalledTimes(1)
  })

  it('should retrieve NodeGit diff for a path and pass to compilePatchesFromDiff on call to diffPath ', async () => {
    const target = './test_path'
    const file_target = './test_path/file.md'

    const repository = new Repository(target)
    repository.compilePatchesFromDiff = jest.fn(await_resolve<void>())

    await repository.load()
    await repository.diffPath(file_target)

    expect(repository.compilePatchesFromDiff).toHaveBeenCalledTimes(1)
  })

  it('should load NodeGit patches into RepositoryPatch objects and store on call to compilePatchesFromDiff', async () => {
    const target = './test_path'

    const repository = new Repository(target)

    await repository.load()

    await repository.compilePatchesFromDiff(mocked_diff)

    expect(repository.patches).not.toBeUndefined()
    expect(repository.patches.length).toBeGreaterThanOrEqual(0)
  })

  it('should stage all available files with stagePath when query is "*" on call to stage', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.stagePath = jest.fn(await_resolve<void>())

    await repository.load()

    repository.available = [
      { path: './test_path/first_file.md', type: 0 },
      { path: './test_path/second_file.md', type: 0 },
      { path: './test_path/third_file.md', type: 0 },
    ]

    await repository.stage('*')

    expect(repository.stagePath).toHaveBeenCalledTimes(3)
  })

  // it('should stage provided path add with stagePath when query is a path on call to stage', async () => {
  //   const target = './test_path'
  //   const file_target = './test_path/file.md'

  //   const repository = new Repository(target)

  //   const notify = jest.fn()

  //   await repository.load()
  //   await repository.stage(file_target, notify)

  //   // const mocked_repository = await mocked_NodeGit.Repository.open.mock.results[0].value as jest.MockedObject<typeof NodeGit.Repository>
  //   // const mocked_repository_index = mocked_repository.refreshIndex.mock.results[0].value

  //   expect(notify).toHaveBeenCalledTimes(1)
  //   expect(mocked_repository_index.addByPath).toHaveBeenCalledTimes(1)
  // })

  // it('should stage provided path remove with stagePath when query is a path on call to stage', async () => {
  //   const target = './test_path'
  //   const file_target = './test_path/file.md'

  //   mocked_fs.existsSync.mockReturnValueOnce(true)
  //   mocked_fs.existsSync.mockReturnValueOnce(false)

  //   const repository = new Repository(target)

  //   const notify = jest.fn()

  //   await repository.load()
  //   await repository.stage(file_target, notify)

  //   // const mocked_repository = await mocked_NodeGit.Repository.open.mock.results[0].value as jest.MockedObject<typeof NodeGit.Repository>
  //   // const mocked_repository_index = mocked_repository.refreshIndex.mock.results[0].value

  //   expect(notify).toHaveBeenCalledTimes(1)
  //   expect(mocked_repository_index.removeByPath).toHaveBeenCalledTimes(1)
  // })

  it('should reset all staged files with resetPath when query is "*" on call to reset', async () => {
    const target = './test_path'

    const repository = new Repository(target)
    repository.resetPath = jest.fn(await_resolve<void>())

    await repository.load()

    repository.staged = [
      { path: './test_path/first_file.md', type: 0 },
      { path: './test_path/second_file.md', type: 0 },
      { path: './test_path/third_file.md', type: 0 },
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

    expect(repository.repository.createCommit).toHaveBeenCalledTimes(1)
  })

  it('should fail to push if no remote is loaded on call to push', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)

    await repository.load()
    await expect(repository.push()).rejects.toThrow()
  })

  it('should push current branch to the loaded remote on call to push', async () => {
    const target = './test_path'
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'
    const url = 'git@git.example.com:remote.git'

    const repository = new Repository(target)
    repository.storeKeyCredentials(private_key, public_key, passphrase)

    await repository.load()
    await repository.loadRemoteBranch(url)
    await repository.push()

    expect(repository.remote_object.push).toHaveBeenCalledTimes(1)
  })
})
