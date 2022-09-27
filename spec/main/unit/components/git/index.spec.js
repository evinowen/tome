const { cloneDeep } = require('lodash')
const electron = require('electron')
const nodegit = require('nodegit')
const Repository = require('@/components/git/Repository')
const _component = require('@/components/git')
const preload = require('@/components/git/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('nodegit', () => ({
  Reset: {},
  Reference: {},
  Repository: {},
  Signature: {},
  Diff: { LINE: 1 }
}))

nodegit.Repository = {
  open: jest.fn(),
  init: jest.fn()
}

jest.mock('@/components/git/Repository', () => require('?/mocks/components/git/Repository'))

describe('GitComponent', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should store constructor upon call to load_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)
  })

  it('should call inspect on repository upon call to inspect_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.inspect_repository()

    const { repository } = component.data()
    expect(repository.inspect).toHaveBeenCalled()
  })

  it('should return new data upon call to refresh_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.refresh_repository()
  })

  it('should return new data upon call to refresh_patches_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.refresh_patches_repository()
  })

  it('should call diffPath on repository upon call to diff_path_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.diff_path_repository('')

    const { repository } = component.data()
    expect(repository.diffPath).toHaveBeenCalled()
  })

  it('should call diffCommit upon call to diff_commit_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.diff_commit_repository('')

    const { repository } = component.data()
    expect(repository.diffCommit).toHaveBeenCalled()
  })

  it('should call storeCredentials upon call to credential_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const private_key = 'private-key'
    const public_key = 'public-key'
    const passphrase = 'password'

    await preload.credential_repository(private_key, public_key, passphrase)

    const { repository } = component.data()
    expect(repository.storeCredentials).toHaveBeenCalled()
  })

  it('should execute file stage with query upon call to stage_repository with add', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.stage_repository(target)
  })

  it('should execute file stage with query upon call to stage_repository with remove', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.stage_repository(target)
  })

  it('should execute file reset upon call to reset_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const query = 'file.md'

    await preload.reset_repository(query)

    const { repository } = component.data()
    expect(repository.reset).toHaveBeenCalled()
  })

  it('should call push upon call to push_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.push_repository()

    const { repository } = component.data()
    expect(repository.push).toHaveBeenCalled()
  })

  it('should clear select branch upon call to clear_remote_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.clear_remote_repository()

    const { repository } = component.data()
    expect(repository.clearRemoteBranch).toHaveBeenCalled()
  })

  it('should load branch by URL upon call to load_remote_url_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const url = 'git@git.example.com:remote.git'

    await preload.load_remote_url_repository(url)

    const { repository } = component.data()
    expect(repository.loadRemoteBranch).toHaveBeenCalled()
  })

  it('should fetch repository status upon call to remote_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    await preload.remote_repository()

    expect(result).toBeDefined()
  })

  it('should call commit upon call to commit_repository', async () => {
    const path = '/project'
    const result = await preload.load_repository(path)

    expect(result.path).toBe(path)

    const name = 'John Doe'
    const email = 'jdoe@example.com'
    const message = 'Commit Message'

    await preload.commit_repository(name, email, message)

    const { repository } = component.data()
    expect(repository.commit).toHaveBeenCalled()
  })
})
