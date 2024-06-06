import { defineStore } from 'pinia'
import api from '@/api'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_templates_store } from '@/store/modules/templates'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import { fetch_repository_history_store } from '@/store/modules/repository/history'
import { fetch_repository_tags_store } from '@/store/modules/repository/tags'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'

export interface RepositoryCommit {
  oid: string
  date: Date
  message: string
}

export interface State {
  name: string
  path: string
  ready: boolean
}

export const StateDefaults = (): State => ({
  name: '',
  path: '',
  ready: false,
})

export const fetch_repository_store = defineStore('repository', {
  state: StateDefaults,
  actions: {
    clear: async function () {
      this.$reset()

      const configuration = fetch_configuration_store()
      await configuration.reset_local()
    },
    open: async function (path) {
      this.path = path
      this.ready = false
      await this.load()
    },
    load: async function () {
      const log = fetch_log_store()
      await log.info(`Loading repository at ${this.path} ... `)

      const repository = await api.repository.load(this.path)
      this.name = repository.name

      const branches = fetch_repository_branches_store()
      await branches.load()

      const history = fetch_repository_history_store()
      await history.load()

      const tags = fetch_repository_tags_store()
      await tags.load()

      const remotes = fetch_repository_remotes_store()
      await remotes.load()

      const credentials = fetch_repository_credentials_store()
      await credentials.load()

      const committer = fetch_repository_committer_store()
      await committer.inspect()

      const committer_signature = fetch_repository_committer_signature_store()
      await committer_signature.sign_name()
      await committer_signature.sign_email()
      await committer_signature.sign_message()

      const actions = fetch_actions_store()
      await actions.load({ path: this.path })

      const templates = fetch_templates_store()
      await templates.load({ path: this.path })

      const configuration = fetch_configuration_store()
      await configuration.load_local()
      try {
        await remotes.select(configuration.active.default_remote)
      } catch (error) {
        log.error('Error connecting to default remote', error)
      }

      this.ready = true
      await log.info(`Repository ${repository.name} ready`)
    },
    loaded: async function () {
      return this.ready
    },
  },
})
