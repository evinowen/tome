import { MutationTree, ActionTree } from 'vuex'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'

export interface State {
  visible: boolean
  target?: string
  position: { x: number, y: number }
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
  items: [],
  menu: undefined,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    fill: function (state, { target, menu }) {
      state.target = target
      state.menu = menu
      state.visible = false
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
    close: async function (context) {
      context.commit('hide')
    },
  },
}
