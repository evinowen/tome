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

interface ContextItem {
  divider?: boolean
  title?: string
  active?: () => boolean
  action?: () => Promise<void>
  load?: () => Promise<ContextItem[]>
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
