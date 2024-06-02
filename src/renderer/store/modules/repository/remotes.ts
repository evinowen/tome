import { defineStore } from 'pinia'
import api, { RepositoryRemote } from '@/api'
import { fetch_log_store } from '@/store/log'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'

class RepositoryRemoteNotFoundError extends Error {}
class RepositoryRemoteNotLoadedError extends Error {}

export interface State {
  list: RepositoryRemote[]
  active: RepositoryRemote
  push: {
    working: boolean
  }
}

export const StateDefaults = (): State => ({
  list: [],
  active: {
    name: '',
    url: '',
    branch: {
      name: '',
      short: '',
    },
    pending: [],
  },
  push: {
    working: false,
  },
})

export const fetch_repository_remotes_store = defineStore('repository-remotes', {
  state: StateDefaults,
  actions: {
    load: async function () {
      this.list = await api.repository.remote_list()
    },
    select: async function (name) {
      await api.repository.remote_clear()

      this.active = StateDefaults().active

      if (!name) {
        return
      }

      const credentials = fetch_repository_credentials_store()
      await credentials.load()

      const repository_remotes = fetch_repository_remotes_store()
      const remote = repository_remotes.list.find((remote) => remote.name === name)

      if (!remote) {
        throw new RepositoryRemoteNotFoundError()
      }

      await api.repository.remote_load(remote.name)

      this.active = await api.repository.remote_status()
    },
    status: async function () {
      this.active = await api.repository.remote_status()
    },
    add: async function (state) {
      const { name, url } = state
      await api.repository.remote_add(name, url)
      await this.load()
    },
    remove: async function (state) {
      const { name } = state
      await api.repository.remote_remove(name)
      await this.load()
    },
    push: async function () {
      const log = fetch_log_store()

      if (this.active === undefined) {
        throw new RepositoryRemoteNotLoadedError()
      }

      const credentials = fetch_repository_credentials_store()
      await credentials.load()

      this.push.working = true

      await log.info(`Pushing to remote ${this.active.name} ...`)

      await api.repository.push()

      await log.info(`Push to remote ${this.active.name} complete`)

      this.push.working = false
    },
  },
})
