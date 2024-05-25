import { MutationTree, ActionTree } from 'vuex'
import signature, { State as SignatureState } from './committer/signature'
import api from '@/api'

export interface State {
  staging: number
  status: RepositoryStatus
  working: boolean

  signature?: SignatureState
}

export interface RepositoryStatus {
  available: RepositoryFileState[]
  staged: RepositoryFileState[]
}

export interface RepositoryFileState {
  path: string
  type: RepositoryFileStateType
}

export enum RepositoryFileStateType {
  New = 'new',
  Modified = 'modified',
  Renamed = 'renamed',
  Deleted = 'deleted',
  Unknown = 'unknown',
}

export const StateDefaults = (): State => ({
  staging: 0,
  status: { available: [], staged: [] },
  working: false,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    refresh: function (state, data) {
      const { available, staged } = data
      state.status.available = available
      state.status.staged = staged
    },
    staging: function (state, advance) {
      if (advance) {
        state.staging++
      } else {
        state.staging--
      }
    },
    commit: function (state, flag) {
      state.working = flag
    },
  },
  actions: <ActionTree<State, unknown>>{
    inspect: async function (context) {
      const result = await api.repository.inspect()

      await context.commit('refresh', result)
    },
    stage: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('log', { level: 'info', message: `Staging query ${query}` }, { root: true })
        await api.repository.stage(query)

        await context.dispatch('inspect')
        await context.dispatch('log', { level: 'info', message: 'Stage complete' }, { root: true })
      } catch (error) {
        await context.dispatch('log', { level: 'error', message: 'Stage failed' }, { root: true })
        throw error
      } finally {
        context.commit('staging', false)
      }
    },
    staged: async function (context) {
      return context.state.status.staged.length > 0
    },
    staging: function (context, advance) {
      context.commit('staging', advance)
    },
    reset: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('log', { level: 'info', message: `Reseting query ${query}` }, { root: true })
        await api.repository.reset(query)

        await context.dispatch('inspect')
        await context.dispatch('log', { level: 'info', message: 'Reset complete' }, { root: true })
      } catch (error) {
        await context.dispatch('log', { level: 'error', message: 'Reset failed' }, { root: true })
        throw error
      } finally {
        context.commit('staging', false)
      }
    },
    commit: async function (context) {
      context.commit('commit', true)

      const { name, email, message } = context.state.signature

      await context.dispatch('log', { level: 'info', message: `Creating commit "${message}" ...` }, { root: true })

      const oid = await api.repository.commit(name, email, message)

      await context.dispatch('log', { level: 'info', message: `Commit "${message}" ${oid} created` }, { root: true })

      await context.dispatch('inspect')

      while (context.state.staging) {
        context.commit('staging', false)
      }

      context.commit('commit', false)
    },
  },
  modules: {
    signature,
  },
}
