import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_input_select_store } from '@/store/modules/input/select'
import { v4 as uuidv4 } from 'uuid'

class MockHTMLElement {
  getBoundingClientRect () {
    return {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
    }
  }
}

describe('store/modules/input/select', () => {
  let input_select

  let element
  let set
  let options

  beforeEach(() => {
    setActivePinia(createPinia())
    input_select = fetch_input_select_store()

    element = (new MockHTMLElement()) as HTMLElement
    set = vi.fn()
    options = [
      { value: 'value-a', label: 'label-a', detail: 'detail-a' },
      { value: 'value-b', label: 'label-b', detail: 'detail-b' },
      { value: 'value-c', label: 'label-c', detail: 'detail-c' },
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate state upon dispatch of show', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.identifier).toEqual(identifier)
    expect(input_select.element).toEqual(element)
    expect(input_select.set).toEqual(set)
    expect(input_select.options).toEqual(options)
    expect(input_select.active).toEqual(options)
  })

  it('should set visible state upon dispatch of show', async () => {
    await input_select.show({ element, set, options })

    expect(input_select.visible).toEqual(true)
  })

  it('should reduce active options state including value matches upon dispatch of filter with valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier, value: 'value-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(1)
  })

  it('should not reduce active options including value matches state upon dispatch of filter with invalid identifier', async () => {
    await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier: uuidv4().toString(), value: 'value-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)
  })

  it('should reduce active options state including label matches upon dispatch of filter with valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier, value: 'label-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(1)
  })

  it('should not reduce active options including label matches state upon dispatch of filter with invalid identifier', async () => {
    await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier: uuidv4().toString(), value: 'label-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)
  })

  it('should restore active options state upon dispatch of filter with blank value and valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier, value: 'value-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(1)

    await input_select.filter({ identifier, value: '' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)
  })

  it('should not restore active options state upon dispatch of filter with blank value and valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(3)

    await input_select.filter({ identifier, value: 'value-a' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(1)

    await input_select.filter({ identifier: uuidv4().toString(), value: '' })

    expect(input_select.options).toHaveLength(3)
    expect(input_select.active).toHaveLength(1)
  })

  it('should call set state function upon dispatch of select with valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.element).toEqual(element)
    expect(input_select.visible).toEqual(true)

    const option = options[0]
    await input_select.select({ identifier, option })

    expect(set).toHaveBeenCalledWith(option)
  })

  it('should not call set state function upon dispatch of select with invalid identifier', async () => {
    await input_select.show({ element, set, options })

    expect(input_select.element).toEqual(element)
    expect(input_select.visible).toEqual(true)

    const option = options[0]
    await input_select.select({ identifier: uuidv4().toString(), option })

    expect(set).not.toHaveBeenCalled()
  })

  it('should set false visible state upon dispatch of hide with valid identifier', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.visible).toEqual(true)

    await input_select.hide({ identifier })

    expect(input_select.visible).toEqual(false)
  })

  it('should not set false visible state upon dispatch of hide with invalid identifier', async () => {
    await input_select.show({ element, set, options })

    expect(input_select.visible).toEqual(true)

    await input_select.hide({ identifier: uuidv4().toString() })

    expect(input_select.visible).toEqual(true)
  })

  it('should set false visible state upon dispatch of close', async () => {
    const identifier = await input_select.show({ element, set, options })

    expect(input_select.identifier).toEqual(identifier)
    expect(input_select.visible).toEqual(true)

    await input_select.close({ identifier })

    expect(input_select.identifier).toEqual('')
    expect(input_select.visible).toEqual(false)
  })
})
