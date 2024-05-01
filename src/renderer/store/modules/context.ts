import { MutationTree, ActionTree } from 'vuex'

export interface State {
  visible: boolean
  target?: string
  position: { x: number, y: number }
  title: string
  items: ContextItem[]
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
})

export class ContextMenu {
  items: ContextItem[] = []

  static define (schema: (ContextMenu) => ContextItem[][]) {
    const menu = new ContextMenu()
    const sections = schema(menu)

    for (const section of sections) {
      if (menu.items.length > 0 && !menu.items.at(-1).divider) {
        menu.items.push({ divider: true })
      }

      menu.items.push(...section)
    }

    return menu.items
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
  key?: ContextKey
  divider?: boolean = false
  active?: () => Promise<boolean>
  action?: (target: string) => Promise<void>
  load?: () => Promise<ContextItem[]>

  items?: ContextItem[] = undefined

  static action (title: string, action: (target: string) => Promise<void>, key?: ContextKey): ContextItem {
    const item = new ContextItem()
    item.title = title
    item.action = action
    item.key = key

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
    return this.key ? this.key.print() : ''
  }
}

export class ContextKey {
  modifiers: {
    key: string
    control: boolean
    option: boolean
    shift: boolean
  }

  constructor () {
    this.modifiers = {
      key: '',
      control: false,
      option: false,
      shift: false,
    }
  }

  static make () {
    return new ContextKey()
  }

  control () {
    this.modifiers.control = true
    return this
  }

  option () {
    this.modifiers.option = true
    return this
  }

  shift () {
    this.modifiers.shift = true
    return this
  }

  key (key: string) {
    this.modifiers.key = key
    return this
  }

  print () {
    const parts = []

    if (this.modifiers.control) {
      parts.push('Ctrl')
    }

    if (this.modifiers.shift) {
      parts.push('Shift')
    }

    if (this.modifiers.option) {
      parts.push('Alt')
    }

    if (this.modifiers.key) {
      parts.push(this.modifiers.key)
    }

    return parts.join('+')
  }
}

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    fill: function (state, items) {
      state.items = items
    },
    clear: function (state) {
      Object.assign(state, StateDefaults())
    },
    show: function (state, { target, title, position }) {
      state.target = target
      state.title = title
      state.position.x = position?.x || 0
      state.position.y = position?.y || 0
      state.visible = true
    },
    hide: function (state) {
      state.visible = false
    },
  },
  actions: <ActionTree<State, unknown>>{
    open: async function (context, state) {
      const { target, title = 'Content', items = [], position } = state || {}

      context.commit('fill', items)
      context.commit('show', { target, title, position })
    },
    close: async function (context) {
      context.commit('hide')
      context.commit('clear')
    },
  },
}
