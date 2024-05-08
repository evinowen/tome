import { describe, afterEach, it, expect, vi } from 'vitest'
import ContextCommand from '@/objects/context/ContextCommand'
import ContextItem from '@/objects/context/ContextItem'

vi.mock('@/objects/context/ContextCommand', () => ({
  default: class {
    control = false
    alt = false
    shift = false
    key = ''

    print = vi.fn()
  },
}))

describe('objects/context/ContextItem', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return action item with set title and action method on call to static method action', async () => {
    const title = 'Example'
    const action = async () => { /* Empty */ }

    const item = ContextItem.action(title, action)

    expect(item.divider).toEqual(false)
    expect(item.title).toEqual(title)
    expect(item.action).toEqual(action)
    expect(item.active).toBeUndefined()
  })

  it('should return action item with conditional on call to static method action followed by call to when', async () => {
    const title = 'Example'
    const action = async () => { /* Empty */ }
    const active = async () => false

    const item = ContextItem.action(title, action).when(active)

    expect(item.divider).toEqual(false)
    expect(item.title).toEqual(title)
    expect(item.action).toEqual(action)
    expect(item.active).toEqual(active)
  })

  it('should return action item with set command method on call to static method action where command is provided', async () => {
    const title = 'Example'
    const action = async () => { /* Empty */ }
    const command = new ContextCommand()

    const item = ContextItem.action(title, action, command)

    expect(item.divider).toEqual(false)
    expect(item.title).toEqual(title)
    expect(item.action).toEqual(action)
    expect(item.command).toEqual(command)
    expect(item.active).toBeUndefined()
  })

  it('should call set command with target set to item on call to execute for action item', async () => {
    const title = 'Example'
    const action = vi.fn(async () => { /* Empty */ })
    const command = new ContextCommand()

    const item = ContextItem.action(title, action, command)

    const target = '/example/target'
    item.target = target

    await item.execute()

    expect(action).toHaveBeenCalledWith(target)
  })

  it('should return value of command shortcut on call to shortcut for action item with command', async () => {
    const title = 'Example'
    const action = vi.fn(async () => { /* Empty */ })
    const command = new ContextCommand()
    const command_shortcut = 'Ctrl-X'
    command.print = vi.fn(() => command_shortcut)

    const item = ContextItem.action(title, action, command)

    expect(await item.shortcut()).toEqual(command_shortcut)
    expect(command.print).toHaveBeenCalledTimes(1)
  })

  it('should return menu item with set title and load method on call to static method menu', async () => {
    const title = 'Example'
    const load = async () => []

    const item = ContextItem.menu(title, load)

    expect(item.divider).toEqual(false)
    expect(item.title).toEqual(title)
    expect(item.load).toEqual(load)
    expect(item.active).toBeUndefined()
  })

  it('should return menu item with conditional on call to static method menu followed by call to when', async () => {
    const title = 'Example'
    const load = async () => []
    const active = async () => false

    const item = ContextItem.menu(title, load).when(active)

    expect(item.divider).toEqual(false)
    expect(item.title).toEqual(title)
    expect(item.load).toEqual(load)
    expect(item.active).toEqual(active)
  })

  it('should load items for menu item on call to dispaly', async () => {
    const title = 'Example'
    const load = async () => [ new ContextItem(), new ContextItem(), new ContextItem() ]

    const item = ContextItem.menu(title, load)

    expect(item.items).toBeUndefined()

    await item.display()

    expect(item.items).toHaveLength(3)
  })

  it('should return divider item on call to static method divider', async () => {
    const item = ContextItem.divider()

    expect(item.divider).toEqual(true)
  })

  it('should return divider item on call to static method divider followed by call to when', async () => {
    const active = async () => false

    const item = ContextItem.divider().when(active)

    expect(item.divider).toEqual(true)
    expect(item.active).toEqual(active)
  })
})
