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

  it('should store constructor upon call to load', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)
  })

  it('should call inspect on repository upon call to inspect', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.inspect()

    const { repository } = component.data()
    expect(repository.inspect).toHaveBeenCalled()
  })

  it('should return new data upon call to refresh', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.refresh()
  })

  it('should return new data upon call to refresh_patches', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.refresh_patches()
  })

  it('should call diffPath on repository upon call to diff_path', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.diff_path('')

    const { repository } = component.data()
    expect(repository.diffPath).toHaveBeenCalled()
  })

  it('should call diffCommit upon call to diff_commit', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.diff_commit('')

    const { repository } = component.data()
    expect(repository.diffCommit).toHaveBeenCalled()
  })

  it('should call storeCredentials upon call to credential', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const private_key = 'private-key'
    const public_key = 'public-key'
    const passphrase = 'password'

    await preload.repository.credential(private_key, public_key, passphrase)

    const { repository } = component.data()
    expect(repository.storeCredentials).toHaveBeenCalled()
  })

  it('should execute file stage with query upon call to stage with add', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.repository.stage(target)
  })

  it('should execute file stage with query upon call to stage with remove', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const target = 'file.md'

    await preload.repository.stage(target)
  })

  it('should execute file reset upon call to reset', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const query = 'file.md'

    await preload.repository.reset(query)

    const { repository } = component.data()
    expect(repository.reset).toHaveBeenCalled()
  })

  it('should call push upon call to push', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.push()

    const { repository } = component.data()
    expect(repository.push).toHaveBeenCalled()
  })

  it('should clear select branch upon call to clear_remote', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.clear_remote()

    const { repository } = component.data()
    expect(repository.clearRemoteBranch).toHaveBeenCalled()
  })

  it('should load branch by URL upon call to load_remote_url', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const url = 'git@git.example.com:remote.git'

    await preload.repository.load_remote_url(url)

    const { repository } = component.data()
    expect(repository.loadRemoteBranch).toHaveBeenCalled()
  })

  it('should fetch repository status upon call to remote', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    await preload.repository.remote()

    expect(result).toBeDefined()
  })

  it('should call commit upon call to commit', async () => {
    const path = '/project'
    const result = await preload.repository.load(path)

    expect(result.path).toBe(path)

    const name = 'John Doe'
    const email = 'jdoe@example.com'
    const message = 'Commit Message'

    await preload.repository.commit(name, email, message)

    const { repository } = component.data()
    expect(repository.commit).toHaveBeenCalled()
  })
})
