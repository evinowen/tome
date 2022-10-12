import { MutationTree, ActionTree } from 'vuex'

export class State {
  visible: boolean = false
  target?: string
  position: { x: number, y: number } = { x: 0, y: 0 }
  title: string = ''
  items: ContextItem[] = []
}

interface ContextItem {
  divider?: boolean
  title?: string
  active?: () => boolean
  action?: () => Promise<void>
  load?: () => Promise<ContextItem[]>
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    fill: function (state, items) {
      state.items = items
    },
    clear: function (state) {
      state.target = undefined
      state.title = ''
      state.items = []
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
    }
  },
  actions: <ActionTree<State, any>>{
    open: async function (context, state) {
      const { target, title = 'Content', items = [], position } = state || {}

      context.commit('fill', items)
      context.commit('show', { target, title, position })
    },
    close: async function (context) {
      context.commit('hide')
      context.commit('clear')
    }
  }
}
