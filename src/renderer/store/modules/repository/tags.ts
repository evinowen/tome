import { MutationTree, ActionTree } from 'vuex'
import api, { RepositoryTag } from '@/api'

export interface State {
  list: RepositoryTag[]
}

export const StateDefaults = (): State => ({
  list: [],
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    load: function (state, { list }) {
      state.list = list
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const { list } = await api.repository.tag_list()
      context.commit('load', { list })
    },
    remove: async function (context, name) {
      await api.repository.tag_remove(name)
      await context.dispatch('load')
    },
  },
}
