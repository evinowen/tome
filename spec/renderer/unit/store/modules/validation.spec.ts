import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_validation_store } from '@/store/modules/validation'

describe('store/modules/validation', () => {
  let validation

  beforeEach(() => {
    setActivePinia(createPinia())
    validation = fetch_validation_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate context on show dispatch', async () => {
    expect(validation.message).toEqual('')
    expect(validation.element).toEqual(undefined)

    const message = 'Error Message'
    const element = new HTMLElement()

    await validation.show(message, element)

    expect(validation.message).toEqual(message)
    expect(validation.element).toEqual(element)
  })

  it('should make visible on show dispatch', async () => {
    expect(validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await validation.show(message, element)

    expect(validation.visible).toEqual(true)
  })

  it('should make hidden on hide dispatch when called with current HTMLElement', async () => {
    expect(validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await validation.show(message, element)
    await validation.hide(element)

    expect(validation.visible).toEqual(false)
  })

  it('should not make hidden on hide dispatch when called with different HTMLElement', async () => {
    expect(validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await validation.show(message, element)
    await validation.hide(new HTMLElement())

    expect(validation.visible).toEqual(true)
  })
})
