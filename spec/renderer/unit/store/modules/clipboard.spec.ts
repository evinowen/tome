import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import { cloneDeep } from 'lodash'
import clipboard, { State as ClipboardState, StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  clipboard: ClipboardState
}

describe('store/modules/clipboard', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store<State>(cloneDeep({ modules: { clipboard } }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    const defaults = ClipboardStateDefaults()

    expect(store.state.clipboard.action).toBe(defaults.action)
    expect(store.state.clipboard.error).toBe(defaults.error)
    expect(store.state.clipboard.content).toEqual(defaults.content)

    expect(store.state.clipboard.undefined).toBeUndefined()
  })

  it('should set action and load value on path copy', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await store.dispatch('clipboard/copy', cut_content)

    expect(store.state.clipboard.action).toBe('copy')
    expect(store.state.clipboard.content).toEqual(cut_content)
  })

  it('should populate empty values when clear is called', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await store.dispatch('clipboard/copy', cut_content)

    expect(store.state.clipboard.action).toBe('copy')
    expect(store.state.clipboard.content).toEqual(cut_content)

    await store.dispatch('clipboard/clear')

    const defaults = ClipboardStateDefaults()

    expect(store.state.clipboard.action).toBe(defaults.action)
    expect(store.state.clipboard.error).toBe(defaults.error)
    expect(store.state.clipboard.content).toEqual(defaults.content)
  })

  it('should set action and load value on path cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md',
    }

    await store.dispatch('clipboard/cut', cut_content)

    expect(store.state.clipboard.action).toBe('cut')
    expect(store.state.clipboard.content).toEqual(cut_content)
  })

  it('should set error if paste triggered with no clipboard', async () => {
    const paste_content = {
      type: 'path',
      target: '/project/second/z.md',
    }

    expect(store.state.clipboard.error).toBeFalsy()

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should call clipboard_paste if paste triggered with clipboard', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await store.dispatch('clipboard/copy', cut_content)

    expect(store.state.clipboard.action).toBe('copy')
    expect(store.state.clipboard.content).toEqual(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md',
    }

    expect(store.state.clipboard.error).toBeFalsy()

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(mocked_api.clipboard.paste).toHaveBeenCalled()
  })

  it('should call clipboard_writetext if text called with a value', async () => {
    const value = 'value'
    await store.dispatch('clipboard/text', value)

    expect(mocked_api.clipboard.writetext).toHaveBeenCalled()
  })

  it('should call clipboard_readtext if text called without a value', async () => {
    await store.dispatch('clipboard/text')

    expect(mocked_api.clipboard.readtext).toHaveBeenCalled()
  })

  it('should return clipboard text value if text called without a value', async () => {
    const value = 'value'
    await store.dispatch('clipboard/text', value)

    expect(mocked_api.clipboard.writetext).toHaveBeenCalled()

    const result = await store.dispatch('clipboard/text')

    expect(result).toEqual(value)
  })

  /*
  it('should fail gracefully when the destination does not exist', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/z.md'
    }

    await store.dispatch('clipboard/cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/w.md'
    }

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should use parent directory for paste destination when target is a file', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('clipboard/cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a.md'
    }

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(mocked_api.file.rename).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when destination is not going to change', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await store.dispatch('clipboard/cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/first/b'
    }

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeTruthy()
  })

  it('should paste stored content using rename if action is cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('clipboard/cut', cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(mocked_api.file.rename).toHaveBeenCalledTimes(1)
  })

  it('should paste stored content using copyFile if action is copied', async () => {
    const copy_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await store.dispatch('clipboard/copy', copy_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await store.dispatch('clipboard/paste', paste_content)

    expect(store.state.clipboard.error).toBeFalsy()
    expect(mocked_api.file.copy).toHaveBeenCalledTimes(1)
  })
  */
})
