import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_context_store } from '@/store/modules/context'
import ContextMenu from '@/objects/context/ContextMenu'

describe('store/modules/context', () => {
  let context

  beforeEach(() => {
    setActivePinia(createPinia())
    context = fetch_context_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should assign stage callback on set dispatch', async () => {
    expect(context.menu).toEqual(undefined)

    const menu = new ContextMenu()
    const stage = async () => menu

    await context.set(stage)

    expect(context.stage).toEqual(stage)
  })

  it('should load menu on open dispatch', async () => {
    expect(context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await context.set(load)

    const position = { x: 100, y: 200 }

    await context.open({ position })

    expect(context.menu).toEqual(menu)
  })

  it('should make visible on open dispatch', async () => {
    expect(context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await context.set(load)

    const position = { x: 100, y: 200 }

    await context.open({ position })

    expect(context.visible).toEqual(true)
  })

  it('should set position on open dispatch', async () => {
    expect(context.position.x).toEqual(0)
    expect(context.position.y).toEqual(0)

    const menu = new ContextMenu()
    const load = async () => menu

    await context.set(load)

    const position = { x: 100, y: 200 }

    await context.open({ position })

    expect(context.position.x).toEqual(position.x)
    expect(context.position.y).toEqual(position.y)
  })

  it('should empty context on close dispatch', async () => {
    expect(context.visible).toEqual(false)

    const menu = new ContextMenu()
    const load = async () => menu

    await context.set(load)

    const position = { x: 100, y: 200 }

    await context.open({ position })

    await context.close()

    expect(context.visible).toEqual(false)
  })
})
