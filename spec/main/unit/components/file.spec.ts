import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import Disk from '../../mocks/support/disk'
import * as fs from 'node:fs'
import * as chokidar from 'chokidar'
import _component from '@/components/file'
import { file as preload } from '@/preload'
import mocked_fs_data from '../../meta/node/fs'
import fs_meta from '../../meta/node/fs'
import * as fs_mock from '../../mocks/node/fs'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('node:fs', () => fs_mock)
jest.doMock('electron', () => electron_mock)

jest.mock('node:path')

jest.mock('chokidar', () => ({
  watch: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chokidar_listeners = new Map<string, (...parameters: any) => void>()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chokidar_exec_event = (event: string, ...parameters: any) => {
  if (!chokidar_listeners.has(event)) {
    return
  }

  const listener = chokidar_listeners.get(event)
  listener(event, ...parameters)
}

const chokidar_watcher = {
  close: jest.fn(() => chokidar_listeners.clear()),
  on: function (channel, listener) {
    chokidar_listeners.set(channel, () => listener())
    return this
  },
} as unknown as chokidar.FSWatcher

const mocked_chokidar = jest.mocked(chokidar)
mocked_chokidar.watch.mockImplementation(() => chokidar_watcher)

describe('components/file', () => {
  let component
  let win
  let log

  const disk = new Disk()

  beforeEach(() => {
    electron_meta.ipc_reset()

    fs_meta.set_disk(disk)
    disk.reset_disk()

    win = new electron.BrowserWindow({})

    log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    }

    component = cloneDeep(_component)
    component.register(win, log)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a watcher upon call to subscribe', async () => {
    const target = '/project/example/test'
    const listener = jest.fn()
    await preload.subscribe(target, listener)

    expect(chokidar.watch).toHaveBeenCalled()

    chokidar_exec_event('all', target)

    expect(listener).toHaveBeenCalled()
  })

  it('should close watcher upon call to clear_subscriptions', async () => {
    const target = '/project'
    const listener = jest.fn()
    await preload.subscribe(target, listener)

    expect(chokidar.watch).toHaveBeenCalled()

    chokidar_exec_event('all', target)

    expect(listener).toHaveBeenCalled()

    await preload.clear_subscriptions()

    expect(chokidar_watcher.close).toHaveBeenCalled()
  })

  it('should return target access upon call to exists', async () => {
    const target = '/project/a.md'
    const result = await preload.exists(target)

    expect(fs.access).toHaveBeenCalled()
    expect(result).not.toBeUndefined()
    expect(result).not.toBeUndefined()
  })

  it('should return if target is directory upon call to is_directory', async () => {
    const target = '/project'
    const result = await preload.is_directory(target)

    expect(fs.lstat).toHaveBeenCalled()
    expect(result).toBe(mocked_fs_data.lstat_return(target).isDirectory())
  })

  it('should create directory upon call to create_directory', async () => {
    const target = '/project/new.directory'
    await preload.create_directory(target)

    expect(fs.mkdir).toHaveBeenCalled()
  })

  it('should load file list upon call to list_directory', async () => {
    const target = '/project'
    const result = await preload.list_directory(target)

    expect(fs.readdir).toHaveBeenCalled()
    expect(result).not.toBeFalsy()
  })

  it('should read file contents upon call to contents', async () => {
    const target = '/project/a.md'
    await preload.contents(target)

    expect(fs.readFile).toHaveBeenCalled()
  })

  it('should write a blank file upon call to create', async () => {
    const target = '/project/new.md'
    await preload.create(target)

    expect(fs.mkdir).not.toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('should write file content upon call to write', async () => {
    const target = '/project/a.md'
    const content = 'File Content'
    await preload.write(target, content)

    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('should rename target file upon call to rename', async () => {
    const target = '/project/a.md'
    const proposed = '/project/a.new.md'
    await preload.rename(target, proposed)

    expect(fs.rename).toHaveBeenCalled()
  })

  it('should open target upon call to open with false container flag', async () => {
    const target = '/project/a.md'
    const container = false
    await preload.open(target, container)

    expect(electron.shell.openPath).toHaveBeenCalled()
  })

  it('should open container for target upon call to open with true container flag', async () => {
    const target = '/project/a.md'
    const container = true
    await preload.open(target, container)

    expect(electron.shell.openPath).toHaveBeenCalled()
  })

  it('should unlink target upon call to delete', async () => {
    const target = '/project/a.md'
    await preload.delete(target)

    expect(fs.unlink).toHaveBeenCalled()
  })

  it('should perform recursive unlink of target upon call to delete for directory', async () => {
    const target = '/project'
    await preload.delete(target)

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
      regex_query: false,
    }

    await preload.search_path(target, criteria)
  })

  it('should run search upon call to search_next', async () => {
    const target = '/project'
    const criteria = {
      query: 'Test',
      case_sensitive: false,
      regex_query: false,
    }

    await preload.search_path(target, criteria)

    await preload.search_next()
  })

  it('should run case_sensitive search upon call to search_next with case_sensitive criteria', async () => {
    const target = '/project'
    const criteria = {
      query: 'Test',
      case_sensitive: true,
      regex_query: false,
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
      regex_query: true,
    }

    await preload.search_path(target, criteria)
    await preload.search_next()
  })

  it('should run regex search upon call to search_next with case_sensitive regex', async () => {
    const target = '/project'
    const criteria = {
      query: '[^ ]*',
      case_sensitive: true,
      regex_query: true,
    }

    await preload.search_path(target, criteria)
    await preload.search_next()
  })
})
