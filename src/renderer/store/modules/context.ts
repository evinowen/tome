import { MutationTree, ActionTree } from 'vuex'

export interface State {
  visible: boolean
  target?: string
  position: { x: number, y: number }
  title: string
  items: ContextItem[]
  menu?: ContextMenu
}

export const StateDefaults = (): State => ({
  visible: false,
  target: '',
  position: {
    x: 0,
    y: 0,
  },
  title: '',
  items: [],
  menu: undefined,
})

export class ContextMenu {
  items: ContextItem[] = []
  shortcuts: Map<string, ContextItem[]> = new Map<string, ContextItem[]>()

  static define (schema: (ContextMenu) => ContextItem[][]) {
    const menu = new ContextMenu()
    const sections = schema(menu)

    for (const section of sections) {
      if (menu.items.length > 0 && !menu.items.at(-1).divider) {
        menu.items.push({ divider: true })
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

export class ContextSection {
  items: ContextItem[] = []

  add (condition, item: ContextItem) {
    if (condition) {
      items.push(item)
    }

    return this
  }
}

export class ContextItem {
  title?: string
  command?: ContextCommand
  divider?: boolean = false
  active?: () => Promise<boolean>
  action?: (target: string) => Promise<void>
  load?: () => Promise<ContextItem[]>

  items?: ContextItem[] = undefined

  static action (title: string, action: (target: string) => Promise<void>, command?: ContextCommand): ContextItem {
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
}

export class ContextCommandFactory {
  command: ContextCommand = new ContextCommand()

  control () {
    this.command.control = true
    return this
  }

  alt () {
    this.command.alt = true
    return this
  }

  shift () {
    this.command.shift = true
    return this
  }

  key (key: string) {
    this.command.key = key
    return this.command
  }
}

export class ContextCommand {
  control: boolean
  alt: boolean
  shift: boolean
  key: string

  constructor () {
    this.control = false
    this.alt = false
    this.shift = false
    this.key = ''
  }

  print () {
    const parts = []

    if (this.control) {
      parts.push('Ctrl')
    }

    if (this.shift) {
      parts.push('Shift')
    }

    if (this.alt) {
      parts.push('Alt')
    }

    if (this.key) {
      parts.push(this.key)
    }

    return parts.join('+')
  }

  static control () {
    return (new ContextCommandFactory()).control()
  }

  static alt () {
    return (new ContextCommandFactory()).alt()
  }

  static shift () {
    return (new ContextCommandFactory()).shift()
  }

  static key (key: string) {
    return (new ContextCommandFactory()).key(key)
  }
}

enum ContextTargetType {
  Explorer,
  ExplorerNode,
  RenderedViewport,
  ComposeViewport,
}

export interface ContextTarget {
  type: ContextTargetType
  path: string
}

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    fill: function (state, { target, menu }) {
      state.target = target
      state.menu = menu
      state.visible = false
    },
    clear: function (state, { target }) {
      if (state.target === target) {
        state.menu = undefined
        state.visible = false
      }
    },
    show: function (state, { position }) {
      state.position.x = position?.x || 0
      state.position.y = position?.y || 0
      state.visible = true
    },
    hide: function (state) {
      state.visible = false
    },
  },
  actions: <ActionTree<State, unknown>>{
    set: async function (context, state) {
      const { target, menu } = state || {}

      context.commit('fill', { target, menu })
    },
    open: async function (context, state) {
      const { position } = state || {}

      context.commit('show', { position })
    },
    clear: async function (context, state) {
      const { target } = state || {}

      context.commit('clear', { target })
    },
    close: async function (context) {
      context.commit('hide')
    },
  },
}
