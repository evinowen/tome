import ContextItem from './ContextItem'

export default class ContextMenu {
  target?: string
  items: ContextItem[] = []
  shortcuts: Map<string, ContextItem[]> = new Map<string, ContextItem[]>()

  constructor (target?: string) {
    this.target = target
  }

  static define (target?: string, schema?: (ContextMenu) => ContextItem[][]) {
    const menu = new ContextMenu(target)
    const sections = schema ? schema(menu) : [] as ContextItem[][]

    for (const section of sections) {
      if (menu.items.length > 0 && !menu.items.at(-1).divider) {
        menu.items.push(ContextItem.divider())
      }

      for (const item of section) {
        item.target = menu.target
      }

      menu.items.push(...section)
    }

    const recurse = (items) => {
      for (const item of items) {
        if (item.command) {
          if (menu.shortcuts.has(item.command.key)) {
            menu.shortcuts.get(item.command.key).push(item)
          } else {
            menu.shortcuts.set(item.command.key, [ item ])
          }
        }

        if (item.items) {
          recurse(item.items)
        }
      }
    }

    recurse(menu.items)

    return menu
  }

  static if (condition: boolean): ContextItem[] | undefined {
    if (!condition) {
      return [] as ContextItem[]
    }
  }
}
