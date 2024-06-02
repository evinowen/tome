import { defineStore } from 'pinia'
import api, { RepositoryHistoricalCommit } from '@/api'

export interface State {
  items: RepositoryHistoricalCommit[]
  loaded: boolean
  index: number
  paging: boolean
  rooted: boolean
}

export const StateDefaults = (): State => ({
  items: [],
  loaded: false,
  index: 0,
  paging: false,
  rooted: false,
})

export const fetch_repository_history_store = defineStore('repository-history', {
  state: StateDefaults,
  actions: {
    load: async function () {
      this.index = 1
      this.items = await api.repository.history_list(1)
      this.loaded = true

      if (this.items.some((item) => item.root)) {
        this.rooted = true
      }
    },
    page: async function () {
      if (!this.loaded) {
        return
      }

      if (this.rooted) {
        return
      }

      this.paging = true

      this.index = this.index + 1
      this.items.push(...await api.repository.history_list(this.index))

      if (this.items.some((item) => item.root)) {
        this.rooted = true
      }

      this.paging = false
    },
  },
})
