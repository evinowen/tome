import { defineStore } from 'pinia'
import api, { RepositoryTag } from '@/api'

export interface State {
  list: RepositoryTag[]
}

export const StateDefaults = (): State => ({
  list: [],
})

export const fetch_repository_tags_store = defineStore('repository-tags', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const { list } = await api.repository.tag_list()
      this.list = list
    },
    create: async function ({ name, oid }) {
      await api.repository.tag_create(name, oid)
      await this.load()
    },
    remove: async function (name) {
      await api.repository.tag_remove(name)
      await this.load()
    },
  },
})
