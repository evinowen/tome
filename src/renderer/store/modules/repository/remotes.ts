import { MutationTree, ActionTree } from 'vuex'
import api from '@/api'

export interface RepositoryRemote {
  name: string
  url: string
}

export interface State {
  list: RepositoryRemote[]
}

export const StateDefaults = (): State => ({
  list: [],
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    load: function (state, list) {
      state.list = list
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const list = await api.repository.remote_list()
      context.commit('load', list)
    },
    add: async function (context, state) {
      const { name, url } = state
      await api.repository.remote_add(name, url)
      await context.dispatch('load')
    },
    remove: async function (context, state) {
      const { name } = state
      await api.repository.remote_remove(name)
      await context.dispatch('load')
    },
  },
}
