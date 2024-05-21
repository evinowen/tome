import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _select, { State as SelectState } from '@/store/modules/input/select'
import { cloneDeep } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

interface State {
  select: SelectState
}

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
  let select

  let element
  let set
  let options

  const factory = {
    wrap: () => new Vuex.Store<State>({
      modules: {
        select,
      },
    }),
  }

  beforeEach(() => {
    select = cloneDeep(_select)

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

  it('should mount into test scafolding without error', async () => {
    const store = factory.wrap()
    expect(store).toBeDefined()
  })

  it('should populate state upon dispatch of show', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.identifier).toEqual(identifier)
    expect(store.state.select.element).toEqual(element)
    expect(store.state.select.set).toEqual(set)
    expect(store.state.select.options).toEqual(options)
    expect(store.state.select.active).toEqual(options)
  })

  it('should set visible state upon dispatch of show', async () => {
    const store = factory.wrap()

    await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.visible).toEqual(true)
  })

  it('should reduce active options state including value matches upon dispatch of filter with valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier, value: 'value-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(1)
  })

  it('should not reduce active options including value matches state upon dispatch of filter with invalid identifier', async () => {
    const store = factory.wrap()

    await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier: uuidv4().toString(), value: 'value-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)
  })

  it('should reduce active options state including label matches upon dispatch of filter with valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier, value: 'label-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(1)
  })

  it('should not reduce active options including label matches state upon dispatch of filter with invalid identifier', async () => {
    const store = factory.wrap()

    await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier: uuidv4().toString(), value: 'label-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)
  })

  it('should restore active options state upon dispatch of filter with blank value and valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier, value: 'value-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(1)

    await store.dispatch('select/filter', { identifier, value: '' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)
  })

  it('should not restore active options state upon dispatch of filter with blank value and valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(3)

    await store.dispatch('select/filter', { identifier, value: 'value-a' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(1)

    await store.dispatch('select/filter', { identifier: uuidv4().toString(), value: '' })

    expect(store.state.select.options).toHaveLength(3)
    expect(store.state.select.active).toHaveLength(1)
  })

  it('should call set state function upon dispatch of set with valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.element).toEqual(element)
    expect(store.state.select.visible).toEqual(true)

    const option = options[0]
    await store.dispatch('select/set', { identifier, option })

    expect(set).toHaveBeenCalledWith(option)
  })

  it('should not call set state function upon dispatch of set with invalid identifier', async () => {
    const store = factory.wrap()

    await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.element).toEqual(element)
    expect(store.state.select.visible).toEqual(true)

    const option = options[0]
    await store.dispatch('select/set', { identifier: uuidv4().toString(), option })

    expect(set).not.toHaveBeenCalled()
  })

  it('should set false visible state upon dispatch of hide with valid identifier', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.visible).toEqual(true)

    await store.dispatch('select/hide', { identifier })

    expect(store.state.select.visible).toEqual(false)
  })

  it('should not set false visible state upon dispatch of hide with invalid identifier', async () => {
    const store = factory.wrap()

    await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.visible).toEqual(true)

    await store.dispatch('select/hide', { identifier: uuidv4().toString() })

    expect(store.state.select.visible).toEqual(true)
  })

  it('should set false visible state upon dispatch of close', async () => {
    const store = factory.wrap()

    const identifier = await store.dispatch('select/show', { element, set, options })

    expect(store.state.select.identifier).toEqual(identifier)
    expect(store.state.select.visible).toEqual(true)

    await store.dispatch('select/close', { identifier })

    expect(store.state.select.identifier).toEqual('')
    expect(store.state.select.visible).toEqual(false)
  })
})
