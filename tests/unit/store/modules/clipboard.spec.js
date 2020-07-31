import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import clipboard from '@/store/modules/clipboard'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({ remote: {} }))

const fs_copy_callback = (mode, callback) => (callback || mode)(null)
const fs_copy_callback_error = (mode, callback) => (callback || mode)('error!')

const _lstat = {
  isDirectory: jest.fn(() => true)
}

const fs = {
  rename: jest.fn((old_path, new_path, callback) => callback(null)),
  copyFile: jest.fn((src, dest, mode, callback) => fs_copy_callback(mode, callback)),
  access: jest.fn((path, callback) => callback(new Error('error!'))),
  lstat: jest.fn((path, callback) => callback(null, _lstat))
}

const path = {
  dirname: jest.fn(path => {
    switch (path) {
      case '/project/first': return '/project'
      case '/project/second': return '/project'
      case '/project/third': return '/project'
      case '/project/first/a': return '/project/first'
      case '/project/first/b': return '/project/first'
      case '/project/first/c': return '/project/first'
      case '/project/second/b': return '/project/second'
      case '/project/second/c': return '/project/second'
      case '/project/third/c': return '/project/third'
    }
    return '/directory'
  }),
  basename: jest.fn(path => 'basename'),
  join: jest.fn((first, second) => `${first}${second}`),
  parse: jest.fn(path => '/directory')
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

describe('store/modules/tome.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({ modules: { clipboard } }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.clipboard.action).toBe(null)
    expect(store.state.clipboard.content).toBe(null)

    expect(store.state.clipboard.undefined).toBeUndefined()
  })

  it('should set action and load value on path copy', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item'
    }

    await store.dispatch('copy', cut_content)

    expect(store.state.clipboard.action).toBe('copy')
    expect(store.state.clipboard.content).toBe(cut_content)
  })

  it('should set action and load value on path cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    expect(store.state.clipboard.action).toBe('cut')
    expect(store.state.clipboard.content).toBe(cut_content)
  })

  it('should set error if paste triggered with no clipboard', async () => {
    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    expect(store.state.clipboard.error).toBeFalsy()

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should fail gracefully when the destination does not exist', async () => {
    fs.lstat.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should use parent directory for paste destination when target is a file', async () => {
    _lstat.isDirectory.mockImplementationOnce(() => false)
    fs.access.mockImplementationOnce((path, callback) => callback(null))

    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(fs.rename).toHaveBeenCalledTimes(1)
    expect(fs.rename.mock.calls[0][0]).toBe(cut_content.target)
  })

  it('should fail gracefully when destination is not going to change', async () => {
    _lstat.isDirectory.mockImplementationOnce(() => false)
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/first/b'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should paste stored content using rename if action is cut', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(fs.rename).toHaveBeenCalledTimes(1)
    expect(fs.rename.mock.calls[0][0]).toBe(cut_content.target)
  })

  it('should set error if problem occurs during paste stored when action is cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('cut', cut_content)

    fs.rename.mockImplementationOnce((old_path, new_path, callback) => callback(new Error('error!')))
    expect(store.state.clipboard.error).toBeFalsy()

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await expect(store.dispatch('paste', paste_content)).rejects.toBeTruthy()

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should paste stored content using copyFile if action is copied', async () => {
    const copy_content = {
      type: 'path',
      target: '/path/to/copy/item'
    }

    await store.dispatch('copy', copy_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(fs.copyFile).toHaveBeenCalledTimes(1)
    expect(fs.copyFile.mock.calls[0][0]).toBe(copy_content.target)
  })

  it('should set error if problem occurs during paste stored when action is copied', async () => {
    const copy_content = {
      type: 'path',
      target: '/path/to/copy/item'
    }

    await store.dispatch('copy', copy_content)

    fs.copyFile.mockImplementationOnce((src, dest, mode, callback) => fs_copy_callback_error(mode, callback))
    expect(store.state.clipboard.error).toBeFalsy()

    const paste_content = {
      type: 'path',
      target: '/project/second/a'
    }

    await expect(store.dispatch('paste', paste_content)).rejects.toBeTruthy()

    expect(store.state.clipboard.error).toBeTruthy()
  })
})
