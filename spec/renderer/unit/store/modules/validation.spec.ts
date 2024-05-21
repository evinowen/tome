import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _validation, { State as ValidationState } from '@/store/modules/validation'
import { cloneDeep } from 'lodash'

interface State {
  validation: ValidationState
}

describe('store/modules/validation', () => {
  let validation

  const factory = {
    wrap: () => new Vuex.Store<State>({
      modules: {
        validation,
      },
    }),
  }

  beforeEach(() => {
    validation = cloneDeep(_validation)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate context on show dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.validation.message).toEqual('')
    expect(store.state.validation.element).toEqual(undefined)

    const message = 'Error Message'
    const element = new HTMLElement()

    await store.dispatch('validation/show', { message, element })

    expect(store.state.validation.message).toEqual(message)
    expect(store.state.validation.element).toEqual(element)
  })

  it('should make visible on show dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await store.dispatch('validation/show', { message, element })

    expect(store.state.validation.visible).toEqual(true)
  })

  it('should make hidden on hide dispatch when called with current HTMLElement', async () => {
    const store = factory.wrap()

    expect(store.state.validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await store.dispatch('validation/show', { message, element })
    await store.dispatch('validation/hide', { element })

    expect(store.state.validation.visible).toEqual(false)
  })

  it('should not make hidden on hide dispatch when called with different HTMLElement', async () => {
    const store = factory.wrap()

    expect(store.state.validation.visible).toEqual(false)

    const message = 'Error Message'
    const element = new HTMLElement()

    await store.dispatch('validation/show', { message, element })
    await store.dispatch('validation/hide', { element: new HTMLElement() })

    expect(store.state.validation.visible).toEqual(true)
  })
})
