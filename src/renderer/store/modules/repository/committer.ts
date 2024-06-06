import { defineStore } from 'pinia'
import { fetch_repository_committer_signature_store } from './committer/signature'
import api, { RepositoryFile } from '@/api'
import { fetch_log_store } from '@/store/log'

export interface State {
  status: RepositoryStatus
  process: {
    staging: boolean
    commit: boolean
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
  process: {
    staging: false,
    commit: false,
  },
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
    commit: async function () {
      this.process.commit = true

      const log = fetch_log_store()

      const signature = fetch_repository_committer_signature_store()
      const { name, email, message } = signature

      await log.info(`Creating commit "${message}" ...`)

      const oid = await api.repository.commit(name, email, message)

      await log.info(`Commit "${message}" ${oid} created`)

      await this.inspect()

      this.process.commit = false
    },
  },
})
