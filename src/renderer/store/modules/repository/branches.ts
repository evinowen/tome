import { defineStore } from 'pinia'
import api, { RepositoryBranch } from '@/api'

export interface State {
  list: RepositoryBranch[]
  active: string
}

export const StateDefaults = (): State => ({
  list: [],
  active: '',
})

export const fetch_repository_branches_store = defineStore('repository-branches', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const { active, list } = await api.repository.branch_status()
      this.list = list
      this.active = active
    },
    create: async function (name) {
      await api.repository.branch_create(name)
      await this.load()
    },
    select: async function (name) {
      await api.repository.branch_select(name)
      await this.load()
    },
    rename: async function ({ name, value }) {
      await api.repository.branch_rename(name, value)
      await this.load()
    },
    remove: async function (name) {
      await api.repository.branch_remove(name)
      await this.load()
    },
  },
})
