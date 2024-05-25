import { MutationTree, ActionTree } from 'vuex'
import api, { RepositoryHistoricalCommit } from '@/api'

export interface State {
  items: RepositoryHistoricalCommit[]
  loaded: boolean
  page: number
  paging: boolean
  rooted: boolean
}

export const StateDefaults = (): State => ({
  items: [],
  loaded: false,
  page: 0,
  paging: false,
  rooted: false,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    load: function (state, items: RepositoryHistoricalCommit[]) {
      state.page = 1
      state.items = items
      state.loaded = true

      if (items.some((item) => item.root)) {
        state.rooted = true
      }
    },
    page: function (state, items: RepositoryHistoricalCommit[]) {
      state.page = state.page + 1
      state.items.push(...items)

      if (items.some((item) => item.root)) {
        state.rooted = true
      }
    },
    paging: function (state, value: boolean) {
      state.paging = value
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      if (context.state.loaded) {
        return
      }

      const list = await api.repository.history_list(1)
      context.commit('load', list)
    },
    page: async function (context) {
      if (!context.state.loaded) {
        return
      }

      if (context.state.rooted) {
        return
      }

      context.commit('paging', true)
      const list = await api.repository.history_list(context.state.page + 1)
      context.commit('page', list)
      context.commit('paging', false)
    },
  },
}
