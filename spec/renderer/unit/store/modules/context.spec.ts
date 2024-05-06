import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _context, { State as ContextState } from '@/store/modules/context'
import ContextMenu from '@/objects/context/ContextMenu'
import { cloneDeep } from 'lodash'

interface State {
  context: ContextState
}

describe('store/modules/context', () => {
  let context

  const factory = {
    wrap: () => new Vuex.Store<State>({
      modules: {
        context,
      },
    }),
  }

  beforeEach(() => {
    context = cloneDeep(_context)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate context on set dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.target).toEqual('')
    expect(store.state.context.menu).toEqual(undefined)

    const target = '/path'
    const menu = new ContextMenu()

    await store.dispatch('context/set', { target, menu })

    expect(store.state.context.target).toEqual(target)
    expect(store.state.context.menu).toEqual(menu)
  })

  it('should make visible on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)

    const target = '/path'
    const menu = new ContextMenu()

    await store.dispatch('context/set', { target, menu })

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    expect(store.state.context.visible).toEqual(true)
  })

  it('should set position on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.position.x).toEqual(0)
    expect(store.state.context.position.y).toEqual(0)

    const target = '/path'
    const menu = new ContextMenu()

    await store.dispatch('context/set', { target, menu })

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    expect(store.state.context.position.x).toEqual(position.x)
    expect(store.state.context.position.y).toEqual(position.y)
  })

  it('should empty context on close dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)

    const target = '/path'
    const menu = new ContextMenu()

    await store.dispatch('context/set', { target, menu })

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { target, menu, position })

    await store.dispatch('context/close')

    expect(store.state.context.visible).toEqual(false)
  })
})
