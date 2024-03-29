import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _context, { State as ContextState } from '@/store/modules/context'
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

  it('should populate context with minimal input on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)
    expect(store.state.context.target).toEqual('')
    expect(store.state.context.title).toEqual('')
    expect(store.state.context.position.x).toEqual(0)
    expect(store.state.context.position.y).toEqual(0)
    expect(store.state.context.items).toEqual([])

    await store.dispatch('context/open')

    expect(store.state.context.visible).toEqual(true)
  })

  it('should populate context on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)
    expect(store.state.context.target).toEqual('')
    expect(store.state.context.title).toEqual('')
    expect(store.state.context.position.x).toEqual(0)
    expect(store.state.context.position.y).toEqual(0)
    expect(store.state.context.items).toEqual([])

    const target = '/path'
    const title = 'Content'
    const items = []
    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { target, title, items, position })

    expect(store.state.context.visible).toEqual(true)
    expect(store.state.context.target).toEqual(target)
    expect(store.state.context.title).toEqual(title)
    expect(store.state.context.position.x).toEqual(position.x)
    expect(store.state.context.position.y).toEqual(position.y)
    expect(store.state.context.items).toEqual([])
  })

  it('should empty context on close dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)
    expect(store.state.context.target).toEqual('')
    expect(store.state.context.title).toEqual('')
    expect(store.state.context.position.x).toEqual(0)
    expect(store.state.context.position.y).toEqual(0)
    expect(store.state.context.items).toEqual([])

    const target = '/path'
    const title = 'Content'
    const items = []
    const position = { x: 100, y: 200 }

    await store.dispatch('context/open', { target, title, items, position })

    expect(store.state.context.visible).toEqual(true)
    expect(store.state.context.target).toEqual(target)
    expect(store.state.context.title).toEqual(title)
    expect(store.state.context.position.x).toEqual(position.x)
    expect(store.state.context.position.y).toEqual(position.y)
    expect(store.state.context.items).toEqual([])

    await store.dispatch('context/close')

    expect(store.state.context.visible).toEqual(false)
    expect(store.state.context.target).toEqual('')
    expect(store.state.context.title).toEqual('')
    expect(store.state.context.items).toEqual([])
  })
})
