import { MutationTree, ActionTree } from 'vuex'
import api, { RepositoryBranch } from '@/api'

export interface State {
  list: RepositoryBranch[]
  active: string
}

export const StateDefaults = (): State => ({
  list: [],
  active: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    load: function (state, { active, list }) {
      state.list = list
      state.active = active
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const { active, list } = await api.repository.branch_status()
      context.commit('load', { active, list })
    },
    create: async function (context, name) {
      await api.repository.branch_create(name)
      await context.dispatch('load')
    },
    select: async function (context, name) {
      await api.repository.branch_select(name)
      await context.dispatch('load')
    },
    rename: async function (context, { name, value }) {
      await api.repository.branch_rename(name, value)
      await context.dispatch('load')
    },
    remove: async function (context, name) {
      await api.repository.branch_remove(name)
      await context.dispatch('load')
    },
  },
}
