import { MutationTree, ActionTree } from 'vuex'
import api from '@/api'

export interface State {
  patches: RepositoryPatches[]
  type: string
  reference: string
  message: string
}

export interface RepositoryPatches {
  name: string
  path: string
  lines: RepositoryPatchLine[]
}

export interface RepositoryPatchLine {
  type: RepositoryPatchLineType
  line: string
}

export enum RepositoryPatchLineType {
  CONTEXT = 32,
  ADDITION = 43,
  DELETION = 45,
  CONTEXT_EOFNL = 61,
  ADD_EOFNL = 62,
  DEL_EOFNL = 60,
  FILE_HDR = 70,
  HUNK_HDR = 72,
  BINARY = 66,
}

export const StateDefaults = (): State => ({
  patches: [],
  type: '',
  reference: '',
  message: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    clear: function (state) {
      Object.assign(state, StateDefaults())
    },
    update: function (state, data) {
      const { type, reference, patches, message } = data

      state.patches = patches
      state.type = type
      state.reference = reference
      state.message = message
    },
  },
  actions: <ActionTree<State, unknown>>{
    diff: async function (context, data) {
      const { path, commit } = data

      let type = ''
      let reference = ''

      if (path) {
        type = 'patch'
        reference = path
        const { patches } = await api.repository.diff_path(path)
        context.commit('update', { type, reference, patches, message: '' })
      } else if (commit) {
        type = 'commit'
        reference = String(commit).toLowerCase()

        const { patches, message } = await api.repository.diff_commit(commit)
        context.commit('update', { type, reference, patches, message })
      }
    },
  },
}
