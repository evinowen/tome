import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_clipboard_store, StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/clipboard', () => {
  let clipboard

  beforeEach(() => {
    setActivePinia(createPinia())

    clipboard = fetch_clipboard_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    const defaults = ClipboardStateDefaults()

    expect(clipboard.action).toBe(defaults.action)
    expect(clipboard.error).toBe(defaults.error)
    expect(clipboard.content).toEqual(defaults.content)

    expect(clipboard.undefined).toBeUndefined()
  })

  it('should set action and load value on path copy', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await clipboard.copy(cut_content)

    expect(clipboard.action).toBe('copy')
    expect(clipboard.content).toEqual(cut_content)
  })

  it('should populate empty values when clear is called', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await clipboard.copy(cut_content)

    expect(clipboard.action).toBe('copy')
    expect(clipboard.content).toEqual(cut_content)

    await clipboard.clear()

    const defaults = ClipboardStateDefaults()

    expect(clipboard.action).toBe(defaults.action)
    expect(clipboard.error).toBe(defaults.error)
    expect(clipboard.content).toEqual(defaults.content)
  })

  it('should set action and load value on path cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md',
    }

    await clipboard.cut(cut_content)

    expect(clipboard.action).toBe('cut')
    expect(clipboard.content).toEqual(cut_content)
  })

  it('should set error if paste triggered with no clipboard', async () => {
    const paste_content = {
      type: 'path',
      target: '/project/second/z.md',
    }

    expect(clipboard.error).toBeFalsy()

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeTruthy()
  })

  it('should call clipboard_paste if paste triggered with clipboard', async () => {
    const cut_content = {
      type: 'path',
      target: '/path/to/copy/item',
    }

    await clipboard.copy(cut_content)

    expect(clipboard.action).toBe('copy')
    expect(clipboard.content).toEqual(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md',
    }

    expect(clipboard.error).toBeFalsy()

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeFalsy()
    expect(mocked_api.clipboard.paste).toHaveBeenCalled()
  })

  it('should call clipboard_writetext if text called with a value', async () => {
    const value = 'value'
    await clipboard.text(value)

    expect(mocked_api.clipboard.writetext).toHaveBeenCalled()
  })

  it('should call clipboard_readtext if text called without a value', async () => {
    await clipboard.text()

    expect(mocked_api.clipboard.readtext).toHaveBeenCalled()
  })

  it('should return clipboard text value if text called without a value', async () => {
    const value = 'value'
    await clipboard.text(value)

    expect(mocked_api.clipboard.writetext).toHaveBeenCalled()

    const result = await clipboard.text()

    expect(result).toEqual(value)
  })

  /*
  it('should fail gracefully when the destination does not exist', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/z.md'
    }

    await clipboard.cut(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/w.md'
    }

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeTruthy()
  })

  it('should use parent directory for paste destination when target is a file', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await clipboard.cut(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/a.md'
    }

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeFalsy()
    expect(mocked_api.file.rename).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when destination is not going to change', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a'
    }

    await clipboard.cut(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/first/b'
    }

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeTruthy()
  })

  it('should paste stored content using rename if action is cut', async () => {
    const cut_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await clipboard.cut(cut_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeFalsy()
    expect(mocked_api.file.rename).toHaveBeenCalledTimes(1)
  })

  it('should paste stored content using copyFile if action is copied', async () => {
    const copy_content = {
      type: 'path',
      target: '/project/first/a.md'
    }

    await clipboard.copy(copy_content)

    const paste_content = {
      type: 'path',
      target: '/project/second/z.md'
    }

    await clipboard.paste(paste_content)

    expect(clipboard.error).toBeFalsy()
    expect(mocked_api.file.copy).toHaveBeenCalledTimes(1)
  })
  */
})
