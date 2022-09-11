import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import _context from '@/store/modules/context'
import { cloneDeep } from 'lodash'

describe('store/modules/context.js', () => {
  let localVue

  let context
  const factory = {
    wrap: () => new Vuex.Store({
      modules: {
        context
      }
    })
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    context = cloneDeep(_context)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate context with minimal input on open dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.context.visible).toEqual(false)
    expect(store.state.context.target).toEqual(null)
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
    expect(store.state.context.target).toEqual(null)
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
    expect(store.state.context.target).toEqual(null)
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
    expect(store.state.context.target).toEqual(null)
    expect(store.state.context.title).toEqual('')
    expect(store.state.context.items).toEqual([])
  })
})
