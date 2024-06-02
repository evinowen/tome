import { defineStore } from 'pinia'
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

export const fetch_repository_comparator_store = defineStore('repository-comparator', {
  state: StateDefaults,
  actions: {
    diff: async function (data) {
      const { path, commit } = data

      this.$reset()

      if (path) {
        this.type = 'patch'
        this.reference = path

        const { patches } = await api.repository.diff_path(path)
        this.patches = patches
      } else if (commit) {
        this.type = 'commit'
        this.reference = String(commit).toLowerCase()

        const { patches, message } = await api.repository.diff_commit(commit)
        this.patches = patches
        this.message = message
      }
    },
  },
})
