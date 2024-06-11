import { defineStore } from 'pinia'
import api, { RepositoryRemote } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'

class RepositoryRemoteNotLoadedError extends Error {}

export interface State {
  list: RepositoryRemote[]
  selected: string
  error: string
  active: RepositoryRemote
  process: {
    push: boolean
    select: boolean
  }
}

export const StateDefaults = (): State => ({
  list: [],
  selected: '',
  error: '',
  active: {
    name: '',
    url: '',
    branch: {
      name: '',
      short: '',
    },
    pending: [],
  },
  process: {
    push: false,
    select: false,
  },
})

export const fetch_repository_remotes_store = defineStore('repository-remotes', {
  state: StateDefaults,
  actions: {
    load: async function () {
      this.list = await api.repository.remote_list()
    },
    clear: async function () {
      this.selected = ''
      this.active = StateDefaults().active
    },
    select: async function (name) {
      const log = fetch_log_store()

      this.process.select = true

      this.selected = name
      this.error = ''
      this.active = StateDefaults().active

      try {
        await api.repository.remote_clear()

        const credentials = fetch_repository_credentials_store()
        await credentials.load()

        const result = await api.repository.remote_load(this.selected)
        if (result.error && result.error != '') {
          this.error = result.error
        } else {
          await this.status()
        }
      } catch (error) {
        log.error(error, error.stack)
      }

      this.process.select = false
    },
    status: async function () {
      const result = await api.repository.remote_status()

      if (result.error) {
        this.error = result.error
      } else {
        this.active = result
      }
    },
    reselect: async function () {
      await this.select(this.selected)
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

      this.process.push = true

      if (this.active === undefined) {
        throw new RepositoryRemoteNotLoadedError()
      }

      const credentials = fetch_repository_credentials_store()
      await credentials.load()

      await log.info(`Pushing to remote ${this.active.name} ...`)

      await api.repository.push()

      await log.info(`Push to remote ${this.active.name} complete`)

      this.process.push = false
    },
  },
})
