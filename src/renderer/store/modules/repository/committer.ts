import { defineStore } from 'pinia'
import { DateTime } from 'luxon'
import api, { RepositoryFile } from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_repository_history_store } from '@/store/modules/repository/history'

export interface State {
  status: RepositoryStatus
  message: string
  process: {
    staging: boolean
    commit: boolean
  }
  error: {
    name: boolean
    email: boolean
    message: boolean
  }
}

export interface RepositoryStatus {
  available: RepositoryFile[]
  staged: RepositoryFile[]
}

export enum RepositoryFileStateType {
  New = 'new',
  Modified = 'modified',
  Renamed = 'renamed',
  Deleted = 'deleted',
  Unknown = 'unknown',
}

export const StateDefaults = (): State => ({
  status: { available: [], staged: [] },
  message: '',
  process: {
    staging: false,
    commit: false,
  },
  error: {
    name: false,
    email: false,
    message: false,
  },
})

const SignatureMessageDateString = () =>
  DateTime.now().toLocaleString({
    weekday: 'short',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

export const fetch_repository_committer_store = defineStore('repository-committer', {
  state: StateDefaults,
  actions: {
    inspect: async function () {
      const { available, staged } = await api.repository.inspect()

      this.status.available = available
      this.status.staged = staged
    },
    stage: async function (query) {
      this.process.staging = true

      const log = fetch_log_store()

      try {
        await log.info(`Staging query ${query}`)
        await api.repository.stage(query)

        await this.inspect()
        await log.info('Stage complete')
      } catch (error) {
        await log.error('Stage failed')
        throw error
      } finally {
        this.process.staging = false
      }
    },
    reset: async function (query) {
      this.process.staging = true

      const log = fetch_log_store()

      try {
        await log.info(`Reseting query ${query}`)
        await api.repository.reset(query)

        await this.inspect()
        await log.info('Reset complete')
      } catch (error) {
        await log.error('Reset failed')
        throw error
      } finally {
        this.process.staging = false
      }
    },
    compose: function (value?, populate = false) {
      if (value !== undefined) {
        this.message = value
      }

      if (this.message === '' && populate) {
        this.message = `Update for ${SignatureMessageDateString()}`
      }
    },
    commit: async function () {
      this.process.commit = true

      const log = fetch_log_store()

      const configuration = fetch_configuration_store()
      const { name, email } = configuration.active.signature

      await log.info(`Creating commit "${this.message}" ...`)

      const oid = await api.repository.commit(name, email, this.message)

      await log.info(`Commit "${this.message}" ${oid} created`)
      this.message = ''

      await this.inspect()

      const repository_history = fetch_repository_history_store()
      await repository_history.unload()

      this.process.commit = false
    },
    uncheck: function () {
      this.error.name = false
      this.error.email = false
      this.error.message = false
    },
    check: function () {
      const configuration = fetch_configuration_store()
      this.uncheck()

      const name = configuration.active.signature.name
      if (name.length === 0) {
        this.error.name = true
      }

      const email = configuration.active.signature.email
      if (email.length === 0) {
        this.error.email = true
      }

      if (this.message.length === 0) {
        this.error.message = true
      }

      if (this.error.name || this.error.email || this.error.message) {
        return false
      }

      return true
    },
  },
})
