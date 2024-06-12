import { defineStore } from 'pinia'
import api, { RepositoryBranch } from '@/api'
import { fetch_repository_history_store } from '@/store/modules/repository/history'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import BranchNameError from '@/objects/errors/BranchNameError'
import BranchSelectError from '@/objects/errors/BranchSelectError'
import BranchRemoveError from '@/objects/errors/BranchRemoveError'

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
      const result = await api.repository.branch_create(name)

      if (await BranchNameError(result, name)) {
        return
      }

      await this.load()
    },
    select: async function (name) {
      const result = await api.repository.branch_select(name)

      if (await BranchSelectError(result, name)) {
        return
      }

      await this.load()

      const repository_history = fetch_repository_history_store()
      await repository_history.reload()

      const repository_committer = fetch_repository_committer_store()
      await repository_committer.inspect()
    },
    rename: async function ({ name, value }) {
      const result = await api.repository.branch_rename(name, value)

      await BranchNameError(result, value)
      await this.load()
    },
    remove: async function (name) {
      const result = await api.repository.branch_remove(name)

      await BranchRemoveError(result)
      await this.load()
    },
  },
})
