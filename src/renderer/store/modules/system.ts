import { defineStore } from 'pinia'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_store } from '@/store/modules/repository'
import api from '@/api'
import Commit from '@/objects/performances/Commit'
import QuickCommit from '@/objects/performances/QuickCommit'
import AutoCommit from '@/objects/performances/AutoCommit'
import Push from '@/objects/performances/Push'
import QuickPush from '@/objects/performances/QuickPush'
import AutoPush from '@/objects/performances/AutoPush'

export enum SystemPerformance {
  Commit = 'commit',
  QuickCommit = 'quick-commit',
  AutoCommit = 'auto-commit',
  Push = 'push',
  QuickPush = 'quick-push',
  AutoPush = 'auto-push',
}

export enum SystemTimeout {
  Minute = 'minute',
  QuarterHour = 'quarter-hour',
  HalfHour = 'half-hour',
  Hour = 'hour',
  QuarterDay = 'quarter-day',
  HalfDay = 'half-day',
  Day = 'day',
}

export interface State {
  version?: string
  process?: {
    versions?: Record<string, string>
    sandboxed: boolean
  }
  maximized: boolean
  branches: boolean
  branches_remove_confirm: boolean
  commit: boolean
  commit_confirm: boolean
  console: boolean
  edit: boolean
  history: boolean
  history_tag: boolean
  patch: boolean
  push: boolean
  push_confirm: boolean
  remotes: boolean
  search: boolean
  settings: boolean
  tags: boolean
  tags_remove_confirm: boolean
  theme_editor: boolean
}

export const SystemPages = new Set([
  'branches',
  'branches_remove_confirm',
  'commit',
  'commit_confirm',
  'console',
  'edit',
  'history',
  'history_tag',
  'patch',
  'push',
  'push_confirm',
  'remotes',
  'search',
  'settings',
  'tags',
  'tags_remove_confirm',
  'theme_editor',
])

export const StateDefaults = (): State => ({
  maximized: false,
  branches: false,
  branches_remove_confirm: false,
  commit: false,
  commit_confirm: false,
  console: false,
  edit: false,
  history: false,
  history_tag: false,
  patch: false,
  push: false,
  push_confirm: false,
  remotes: false,
  search: false,
  settings: false,
  tags: false,
  tags_remove_confirm: false,
  theme_editor: false,
})

export const fetch_system_store = defineStore('system', {
  state: StateDefaults,
  actions: {
    load: async function () {
      this.version = await api.app.getVersion()
      this.process = await api.app.getProcess()

      this.maximized = await api.window.is_maximized()
    },
    read: async function (key) {
      return this[key] ?? undefined
    },
    minimize: async function () {
      await api.window.minimize()
      this.maximized = false
    },
    restore: async function () {
      await api.window.restore()
      this.maximized = false
    },
    maximize: async function () {
      await api.window.maximize()
      this.maximized = true
    },
    exit: async function () {
      await api.window.close()
    },
    perform: async function (performance: SystemPerformance) {
      const repository = fetch_repository_store()
      if (!repository.ready) {
        return
      }

      switch (performance) {
        case SystemPerformance.Commit:
          return await Commit.perform()

        case SystemPerformance.QuickCommit:
          return await QuickCommit.perform()

        case SystemPerformance.AutoCommit:
          return await AutoCommit.perform()

        case SystemPerformance.Push:
          return await Push.perform()

        case SystemPerformance.QuickPush:
          return await QuickPush.perform()

        case SystemPerformance.AutoPush:
          return await AutoPush.perform()

        default:
          return false
      }
    },
    page: async function (flags) {
      for (const page in flags) {
        if (!SystemPages.has(page)) {
          continue
        }

        if (typeof flags[page] === 'boolean') {
          this[page] = flags[page]
        }
      }
    },
    timer: async function (timeout: SystemTimeout) {
      const configuration = fetch_configuration_store()
      const log = fetch_log_store()

      await log.trace(`System Timer [${timeout}] Triggered`)

      if (configuration.active.auto_commit && configuration.active.auto_commit_interval === timeout) {
        await log.debug(`Auto-Commit Triggered for timer [${timeout}]`)
        this.perform(SystemPerformance.AutoCommit)
      }
    },
  },
})
