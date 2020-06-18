import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import clipboard from '@/store/modules/clipboard'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({ remote: {} }))

const fs_copy_callback = (mode, callback) => (callback ? callback : mode)(null)
const fs_copy_callback_error = (mode, callback) => (callback ? callback : mode)('error!')

const fs = {
  rename: jest.fn((old_path, new_path, callback) => callback(null)),
  copyFile: jest.fn((src, dest, mode, callback) => fs_copy_callback(mode, callback))
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
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
    expect(store.state.clipboard.content.type).toBe(null)
    expect(store.state.clipboard.content.value).toBe(null)

    expect(store.state.clipboard.undefined).toBeUndefined()
  })

  it('should set action and load value on path copy', async () => {
    const cut_content = {
      type: 'path',
      value: '/path/to/copy/item'
    }

    await store.dispatch('copy', cut_content)

    expect(store.state.clipboard.action).toBe('copy')
    expect(store.state.clipboard.content.type).toBe(cut_content.type)
    expect(store.state.clipboard.content.value).toBe(cut_content.value)
  })

  it('should set action and load value on path cut', async () => {
    const cut_content = {
      type: 'path',
      value: '/path/to/cut/item'
    }

    await store.dispatch('cut', cut_content)

    expect(store.state.clipboard.action).toBe('cut')
    expect(store.state.clipboard.content.type).toBe(cut_content.type)
    expect(store.state.clipboard.content.value).toBe(cut_content.value)
  })

  it('should set error if paste triggered with no clipboard', async () => {
    const paste_content = {
      type: 'path',
      value: '/path/to/paste/item'
    }

    expect(store.state.clipboard.error).toBeFalsy()

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should paste stored content using rename if action is cut', async () => {
    const cut_content = {
      type: 'path',
      value: '/path/to/cut/item'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      value: '/path/to/paste/item'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(fs.rename).toHaveBeenCalledTimes(1)
    expect(fs.rename.mock.calls[0][0]).toBe(cut_content)
    expect(fs.rename.mock.calls[0][1]).toBe(paste_content)
  })

  it('should set error if problem occurs during paste stored when action is cut', async () => {
    const cut_content = {
      type: 'path',
      value: '/path/to/cut/item'
    }

    await store.dispatch('cut', cut_content)

    fs.rename.mockImplementationOnce((old_path, new_path, callback) => callback(new Error('error!')))
    expect(store.state.clipboard.error).toBeFalsy()

    const paste_content = {
      type: 'path',
      value: '/path/to/paste/item'
    }

    await expect(store.dispatch('paste', paste_content)).rejects.toBeTruthy()

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should paste stored content using copyFile if action is copied', async () => {
    const copy_content = {
      type: 'path',
      value: '/path/to/copy/item'
    }

    await store.dispatch('copy', copy_content)

    const paste_content = {
      type: 'path',
      value: '/path/to/paste/item'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(fs.copyFile).toHaveBeenCalledTimes(1)
    expect(fs.copyFile.mock.calls[0][0]).toBe(copy_content)
    expect(fs.copyFile.mock.calls[0][1]).toBe(paste_content)
  })

  it('should set error if problem occurs during paste stored when action is copied', async () => {
    const copy_content = {
      type: 'path',
      value: '/path/to/copy/item'
    }

    await store.dispatch('copy', copy_content)

    fs.copyFile.mockImplementationOnce((src, dest, mode, callback) => fs_copy_callback_error(mode, callback))
    expect(store.state.clipboard.error).toBeFalsy()

    const paste_content = {
      type: 'path',
      value: '/path/to/paste/item'
    }

    await expect(store.dispatch('paste', paste_content)).rejects.toBeTruthy()

    expect(store.state.clipboard.error).toBeTruthy()
  })
})
