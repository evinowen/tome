const { cloneDeep } = require('lodash')
const electron = require('electron')
const { reset_disk } = require('@/../spec/mocks/support/disk')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const { random_string } = require('@/../spec/helpers')(expect)
const _component = require('@/../electron/components/file')
const preload = require('@/../electron/components/file/preload')

let ipcMainMap

jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  },
  ipcRenderer: {
    invoke: jest.fn(),
    send: jest.fn(),
    on: jest.fn()
  },
  dialog: {
    showOpenDialog: jest.fn()
  },
  shell: {
    openPath: jest.fn()
  }
}))

const chokider_event = {
  event: random_string(),
  path: random_string()
}

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcMain.on.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))
electron.ipcRenderer.send.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))
electron.ipcRenderer.on.mockImplementation((channel, listener) => listener({}, chokider_event))

jest.mock('chokidar', () => ({
  watch: jest.fn()
}))

const chokidar_watcher = {
  close: jest.fn(),
  on: function (channel, callback) {
    callback('event', 'path')
    return this
  }
}

chokidar.watch.mockImplementation((target, options) => chokidar_watcher)

jest.mock('fs', () => require('@/../spec/mocks/fs'))
jest.mock('path', () => require('@/../spec/mocks/path'))

describe('FileComponent', () => {
  let component

  beforeEach(() => {
    reset_disk()

    ipcMainMap = new Map()

    win = {
      webContents: {
        send: jest.fn()
      }
    }

    component = cloneDeep(_component)
    component.register(win)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a watcher upon call to file_subscribe', async () => {
    const target = '/project'
    const listener = jest.fn()
    await preload.file_subscribe(target, listener)

    expect(chokidar.watch).toHaveBeenCalled()
    expect(listener).toHaveBeenCalled()
  })

  it('should close watcher upon call to file_clear_subscriptions', async () => {
    const target = '/project'
    const listener = jest.fn()
    await preload.file_subscribe(target, listener)

    expect(chokidar.watch).toHaveBeenCalled()
    expect(listener).toHaveBeenCalled()

    await preload.file_clear_subscriptions()
  })

  it('should return target access upon call to file_exists', async () => {
    const target = '/project/a.md'
    const result = await preload.file_exists(target)

    expect(fs.access).toHaveBeenCalled()
    expect(result).not.toBeUndefined()
    expect(result).not.toBeNull()
  })

  it('should return if target is directory upon call to file_is_directory', async () => {
    const target = '/project'
    const result = await preload.file_is_directory(target)

    expect(fs.lstat).toHaveBeenCalled()
    expect(result).toBe(fs._.lstat_return(target).isDirectory())
  })

  it('should create directory upon call to file_create_directory', async () => {
    const target = '/project/new.directory'
    await preload.file_create_directory(target)

    expect(fs.mkdir).toHaveBeenCalled()
  })

  it('should load file list upon call to file_list_directory', async () => {
    const target = '/project'
    const result = await preload.file_list_directory(target)

    expect(fs.readdir).toHaveBeenCalled()
    expect(result).not.toBeFalsy()
  })

  it('should read file contents upon call to file_contents', async () => {
    const target = '/project/a.md'
    await preload.file_contents(target)

    expect(fs.readFile).toHaveBeenCalled()
  })

  it('should write a blank file upon call to file_create', async () => {
    const target = '/project/new.md'
    await preload.file_create(target)

    expect(fs.mkdir).not.toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('should write file content upon call to file_write', async () => {
    const target = '/project/a.md'
    const content = 'File Content'
    await preload.file_write(target, content)

    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('should rename target file upon call to file_rename', async () => {
    const target = '/project/a.md'
    const proposed = '/project/a.new.md'
    await preload.file_rename(target, proposed)

    expect(fs.rename).toHaveBeenCalled()
  })

  it('should open target upon call to file_open with false container flag', async () => {
    const target = '/project/a.md'
    const container = false
    await preload.file_open(target, container)

    expect(electron.shell.openPath).toHaveBeenCalled()
  })

  it('should open container for target upon call to file_open with true container flag', async () => {
    const target = '/project/a.md'
    const container = true
    await preload.file_open(target, container)

    expect(electron.shell.openPath).toHaveBeenCalled()
  })

  it('should unlink target upon call to file_delete', async () => {
    const target = '/project/a.md'
    await preload.file_delete(target)

    expect(fs.unlink).toHaveBeenCalled()
  })

  it('should perform recursive unlink of target upon call to file_delete for directory', async () => {
    const target = '/project'
    await preload.file_delete(target)

    expect(fs.unlink).toHaveBeenCalled()
  })

  it('should open file dialog select upon call to select_directory', async () => {
    await preload.select_directory()

    expect(electron.dialog.showOpenDialog).toHaveBeenCalled()
  })

  it('should return undefined upon call to directory_list with non-directory target', async () => {
    const target = '/project/a.md'
    await preload.directory_list(target)

    expect(fs.readdir).not.toHaveBeenCalled()
  })

  it('should return file list upon call to directory_list with directory target', async () => {
    const target = '/project'
    await preload.directory_list(target)

    expect(fs.readdir).toHaveBeenCalled()
  })

  it('should configure the search upon call to search_path', async () => {
    const target = '/project'
    const criteria = {
      query: 'Test',
      case_sensitive: false,
      regex_query: false
    }

    await preload.search_path(target, criteria)
  })

  it('should run search upon call to search_next', async () => {
    const target = '/project'
    const criteria = {
      query: 'Test',
      case_sensitive: false,
      regex_query: false
    }

    await preload.search_path(target, criteria)

    await preload.search_next()
  })

  it('should run case_sensitive search upon call to search_next with case_sensitive criteria', async () => {
    const target = '/project'
    const criteria = {
      query: 'Test',
      case_sensitive: true,
      regex_query: false
    }

    await preload.search_path(target, criteria)
    await preload.search_next()
    await preload.search_next()
  })

  it('should run regex search upon call to search_next with regex', async () => {
    const target = '/project'
    const criteria = {
      query: '[^ ]*',
      case_sensitive: false,
      regex_query: true
    }

    await preload.search_path(target, criteria)
    await preload.search_next()
  })

  it('should run regex search upon call to search_next with case_sensitive regex', async () => {
    const target = '/project'
    const criteria = {
      query: '[^ ]*',
      case_sensitive: true,
      regex_query: true
    }

    await preload.search_path(target, criteria)
    await preload.search_next()
  })
})