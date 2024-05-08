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

  it('should assign load callback on set dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.menu).toEqual(undefined)

    const menu = new ContextMenu()
    const load = async () => menu

    await store.dispatch('context/set', load)

    expect(store.state.context.load).toEqual(load)
  })

  it('should load menu on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await store.dispatch('context/set', load)

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    expect(store.state.context.menu).toEqual(menu)
  })

  it('should make visible on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await store.dispatch('context/set', load)

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    expect(store.state.context.visible).toEqual(true)
  })

  it('should set position on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.position.x).toEqual(0)
    expect(store.state.context.position.y).toEqual(0)

    const menu = new ContextMenu()
    const load = async () => menu

    await store.dispatch('context/set', load)

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    expect(store.state.context.position.x).toEqual(position.x)
    expect(store.state.context.position.y).toEqual(position.y)
  })

  it('should empty context on close dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await store.dispatch('context/set', load)

    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { position })

    await store.dispatch('context/close')

    expect(store.state.context.visible).toEqual(false)
  })
})
