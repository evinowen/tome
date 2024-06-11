import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_error_store, ErrorHelpUrl } from '@/store/modules/error'

/* @/store/modules/log */
vi.mock('@/store/modules/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

/* @/api */
import api from '@/api'
vi.mock('@/api', () => ({
  default: {
    file: {
      open: vi.fn(),
    },
  },
}))

describe('store/modules/error', () => {
  let error

  beforeEach(() => {
    setActivePinia(createPinia())
    error = fetch_error_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should assign box values upon call to show action', async () => {
    const title = 'Title'
    const message = 'Message'
    const help = 'help'

    expect(error.title).toEqual('')
    expect(error.message).toEqual('')
    expect(error.help_tag).toEqual('')

    await error.show(title, message, help)

    expect(error.title).toEqual(title)
    expect(error.message).toEqual(message)
    expect(error.help_tag).toEqual(help)
  })

  it('should set visible to true upon call to show action', async () => {
    const title = 'Title'
    const message = 'Message'
    const help = 'help'

    expect(error.visible).toEqual(false)

    await error.show(title, message, help)

    expect(error.visible).toEqual(true)
  })

  it('should set visible to false upon call to hide action', async () => {
    error.visible = true
    expect(error.visible).toEqual(true)

    await error.hide()

    expect(error.visible).toEqual(false)
  })

  it('should call api.file.open upon call to help action', async () => {
    const help = 'help'

    error.help_tag = help
    await error.help()

    expect(api.file.open).toHaveBeenCalledWith(ErrorHelpUrl(help), false)
  })
})
