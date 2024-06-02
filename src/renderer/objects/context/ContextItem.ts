import ContextCommand from './ContextCommand'

export default class ContextItem {
  target?: string
  title?: string
  command?: ContextCommand
  divider?: boolean = false
  active?: () => Promise<boolean>
  action?: (target: string) => Promise<unknown>
  load?: () => Promise<ContextItem[]>

  items?: ContextItem[] = undefined

  static action (title: string, action: (target: string) => Promise<unknown>, command?: ContextCommand): ContextItem {
    const item = new ContextItem()
    item.title = title
    item.action = action
    item.command = command

    return item
  }

  static menu (title: string, load: () => Promise<ContextItem[]>): ContextItem {
    const item = new ContextItem()
    item.title = title
    item.load = load

    return item
  }

  static divider (): ContextItem {
    const item = new ContextItem()
    item.divider = true

    return item
  }

  when (active: () => Promise<boolean>): ContextItem {
    this.active = active
    return this
  }

  async display () {
    if (this.load) {
      this.items = await this.load()
    }
  }

  shortcut () {
    return this.command ? this.command.print() : ''
  }

  async execute () {
    if (this.action !== undefined) {
      await this.action(this.target)
    }
  }
}
