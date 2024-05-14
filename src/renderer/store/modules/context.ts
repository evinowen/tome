import { MutationTree, ActionTree } from 'vuex'
import ContextMenu from '@/objects/context/ContextMenu'

export interface State {
  visible: boolean
  load?: () => Promise<ContextMenu>
  menu?: ContextMenu
  position: { x: number, y: number }
}

export const StateDefaults = (): State => ({
  visible: false,
  load: undefined,
  menu: undefined,
  position: {
    x: 0,
    y: 0,
  },
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, load) {
      state.load = load
    },
    fill: function (state, menu) {
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
    set: async function (context, load) {
      context.commit('set', load)
    },
    load: async function (context) {
      if (context.state.load !== undefined) {
        const menu = await context.state.load()
        context.commit('fill', menu)
      }
    },
    open: async function (context, state) {
      const { position } = state || {}

      await context.dispatch('load')
      context.commit('show', { position })
    },
    close: async function (context) {
      context.commit('hide')
    },
  },
}
