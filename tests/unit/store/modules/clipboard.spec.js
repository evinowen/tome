import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import clipboard from '@/store/modules/clipboard'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

// const _window = {
//   api: {
//     clipboard_paste: jest.fn()
//   }
// }

// jest.spyOn(window, 'window', 'get').mockImplementation(() => _window)

// const fs_copy_callback = (mode, callback) => (callback || mode)(null)
// const fs_copy_callback_error = (mode, callback) => (callback || mode)('error!')

// const _lstat = {
//   isDirectory: jest.fn(() => true)
// }

// const fs = {
//   rename: jest.fn((old_path, new_path, callback) => callback(null)),
//   copyFile: jest.fn((src, dest, mode, callback) => fs_copy_callback(mode, callback)),
//   access: jest.fn((path, callback) => callback(new Error('error!'))),
//   lstat: jest.fn((path, callback) => callback(null, _lstat))
// }

describe('store/modules/clipboard.js', () => {
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
      target: '/project/first/a.md'
    }

    await store.dispatch('cut', cut_content)

    expect(store.state.clipboard.action).toBe('cut')
    expect(store.state.clipboard.content).toBe(cut_content)
  })

  it('should set error if paste triggered with no clipboard', async () => {
    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    expect(store.state.clipboard.error).toBeFalsy()

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  /*
  it('should fail gracefully when the destination does not exist', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/z.md'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/w.md'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should use parent directory for paste destination when target is a file', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a.md'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(window.api.file_rename).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when destination is not going to change', async () => {
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
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(window.api.file_rename).toHaveBeenCalledTimes(1)
  })

  it('should paste stored content using copyFile if action is copied', async () => {
    const copy_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('copy', copy_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await store.dispatch('paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(window.api.file_copy).toHaveBeenCalledTimes(1)
  })
  */
})
