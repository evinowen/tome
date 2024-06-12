import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_option_store, OptionHelpUrl } from '@/store/modules/option'

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

describe('store/modules/option', () => {
  let option

  beforeEach(() => {
    setActivePinia(createPinia())
    option = fetch_option_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should assign box values upon call to show action', async () => {
    const title = 'Title'
    const message = 'Message'
    const question = 'Question?'
    const action = async () => { /* Empty */ }
    const help = 'help'

    expect(option.title).toEqual('')
    expect(option.message).toEqual('')
    expect(option.question).toEqual('')
    expect(option.action).toBeUndefined()
    expect(option.help_tag).toEqual('')

    await option.show(title, message, question, action, help)

    expect(option.title).toEqual(title)
    expect(option.message).toEqual(message)
    expect(option.question).toEqual(question)
    expect(option.action).toEqual(action)
    expect(option.help_tag).toEqual(help)
  })

  it('should set visible to true upon call to show action', async () => {
    const title = 'Title'
    const message = 'Message'
    const question = 'Question?'
    const action = async () => { /* Empty */ }
    const help = 'help'

    expect(option.visible).toEqual(false)

    await option.show(title, message, question, action, help)

    expect(option.visible).toEqual(true)
  })

  it('should set visible to false upon call to hide action', async () => {
    option.visible = true
    expect(option.visible).toEqual(true)

    await option.hide()

    expect(option.visible).toEqual(false)
  })

  it('should call action upon call to confirm action', async () => {
    const action = vi.fn(async () => { /* Empty */ })

    option.action = action
    await option.confirm()

    expect(action).toHaveBeenCalled()
  })

  it('should set visible to false upon call to confirm action', async () => {
    const action = vi.fn(async () => { /* Empty */ })

    option.action = action
    option.visible = true
    expect(option.visible).toEqual(true)

    await option.confirm()

    expect(option.visible).toEqual(false)
  })

  it('should call api.file.open upon call to help action', async () => {
    const help = 'help'

    option.help_tag = help
    await option.help()

    expect(api.file.open).toHaveBeenCalledWith(OptionHelpUrl(help), false)
  })
})
