import { describe, afterEach, it, expect, vi } from 'vitest'
import ContextCommand from '@/objects/context/ContextCommand'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'

vi.mock('@/objects/context/ContextCommand', () => ({
  default: class {
    control = false
    alt = false
    shift = false
    key = ''
  },
}))

vi.mock('@/objects/context/ContextItem', () => ({
  default: class {
    target: string
    divider = false

    static divider () {
      return { divider: true }
    }
  },
}))

describe('objects/context/ContextMenu', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set target through constructor', async () => {
    const target = '/path'

    const menu = new ContextMenu(target)

    expect(menu.target).toEqual(target)
  })

  it('should return new menu through call to static method define', async () => {
    const menu = ContextMenu.define()

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBeTruthy()
  })

  it('should set target through call to static method define', async () => {
    const target = '/path'

    const menu = ContextMenu.define(target)

    expect(menu.target).toEqual(target)
  })

  it('should add items in schema definition to generated menu through call to static method define', async () => {
    const target = '/path'

    const item = new ContextItem()

    const menu = ContextMenu.define(target, () => [
      [
        item,
      ],
    ])

    expect(menu.items).toContain(item)
  })

  it('should set item targets in schema definition to generated menu target through call to static method define', async () => {
    const target = '/path'

    const item = new ContextItem()

    ContextMenu.define(target, () => [
      [
        item,
      ],
    ])

    expect(item.target).toEqual(target)
  })

  it('should add divider items to generated menu through call to static method define', async () => {
    const target = '/path'

    const menu = ContextMenu.define(target, () => [
      [
        new ContextItem(),
      ],
      [
        new ContextItem(),
      ],
    ])

    expect(menu.items.shift().divider).toEqual(false)
    expect(menu.items.shift().divider).toEqual(true)
    expect(menu.items.shift().divider).toEqual(false)
  })

  it('should return empty ContextItem array when condition passed to static method if is false', async () => {
    expect(ContextMenu.if(false)).toEqual([] as ContextItem[])
  })

  it('should undefined when condition passed to static method if is true', async () => {
    expect(ContextMenu.if(true)).toBeUndefined()
  })

  it('should not add item to generated menu through call to static method define using static method if when conditional is false', async () => {
    const target = '/path'

    const menu = ContextMenu.define(target, () => [
      ContextMenu.if(false) || [
        new ContextItem(),
      ],
    ])

    expect(menu.items).toHaveLength(0)
  })

  it('should add item to generated menu through call to static method define using static method if when conditional is true', async () => {
    const target = '/path'

    const menu = ContextMenu.define(target, () => [
      ContextMenu.if(true) || [
        new ContextItem(),
      ],
    ])

    expect(menu.items).toHaveLength(1)
  })

  it('should map item shortcuts in generated menu through call to static method define', async () => {
    const target = '/path'

    const item_with_command = new ContextItem()
    item_with_command.command = new ContextCommand()
    item_with_command.command.key = 'Enter'

    const key = item_with_command.command.key.toLowerCase()

    const menu = ContextMenu.define(target, () => [
      [
        new ContextItem(),
        new ContextItem(),
        item_with_command,
      ],

    ])

    expect(menu.shortcuts.has(key)).toBeTruthy()
  })

  it('should map multiple item shortcuts in generated menu through call to static method define', async () => {
    const target = '/path'

    const item_with_command = new ContextItem()
    item_with_command.command = new ContextCommand()
    item_with_command.command.key = 'Enter'

    const key = item_with_command.command.key.toLowerCase()

    const menu = ContextMenu.define(target, () => [
      [
        new ContextItem(),
        new ContextItem(),
        item_with_command,
        item_with_command,
        item_with_command,
      ],

    ])

    expect(menu.shortcuts.has(key)).toBeTruthy()
    expect(menu.shortcuts.get(key)).toHaveLength(3)
  })

  it('should map nested item shortcuts in generated menu through call to static method define', async () => {
    const target = '/path'

    const item_with_items = new ContextItem()

    const item_with_command = new ContextItem()
    item_with_command.command = new ContextCommand()
    item_with_command.command.key = 'Enter'

    const key = item_with_command.command.key.toLowerCase()

    item_with_items.items = [
      item_with_command,
    ]

    const menu = ContextMenu.define(target, () => [
      [
        new ContextItem(),
        new ContextItem(),
        item_with_items,
      ],

    ])

    expect(menu.shortcuts.has(key)).toBeTruthy()
    expect(menu.shortcuts.get(key)).toHaveLength(1)
  })
})
