import { defineStore } from 'pinia'
import { merge, pickBy, set } from 'lodash'
import vuetify, { presets } from '@/vuetify'
import api from '@/api'
import palette from '@/palette'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_repository_store } from '@/store/modules/repository'
import SettingsSchema from '@/store/schema/configuration/settings'
import SettingsStateDefaults, { State as SettingsState } from '@/store/state/configuration/settings'
import LocalizedStateDefaults, { State as LocalizedState } from '@/store/state/configuration/localized'
export { CredentialType } from '@/store/state/configuration/settings/credentials'

export interface State {
  global: SettingsState
  local: SettingsState
  localized: LocalizedState
  target: SettingsTarget
}

export const StateDefaults = (): State => ({
  global: SettingsStateDefaults(),
  local: SettingsStateDefaults(),
  localized: LocalizedStateDefaults(),
  target: SettingsTarget.Global,
})

export enum SettingsTarget {
  Active = 'active',
  Global = 'global',
  Local = 'local',
}

export const fetch_configuration_store = defineStore('configuration', {
  state: StateDefaults,
  getters: {
    active: (state) => {
      const enabled = new Set(Object.keys(state.localized).filter((key) => state.localized[key]))
      const local = pickBy(state.local, (value, key) => enabled.has(key))

      return merge({}, state.global, local)
    },
  },
  actions: {
    load_global: async function () {
      const log = fetch_log_store()
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      await log.info(`Global configuration established at ${configuration_path}`)

      let data = {}
      const exists = await api.file.exists(configuration_path)

      if (exists) {
        const json = await api.file.contents(configuration_path)
        data = await this.parse(SettingsTarget.Global, json)
        await log.info(`Loaded existing global config.json configuration file at ${configuration_path}`)
      } else {
        await this.write(SettingsTarget.Global)
        await log.info(`Created new global config.json configuration file at ${configuration_path}`)
      }

      merge(this.$state.global, data)

      await this.present(SettingsTarget.Global)
    },
    load_local: async function () {
      const log = fetch_log_store()
      const repository = fetch_repository_store()
      const configuration_directory = await api.path.join(repository.path, '.tome')
      const configuration_gitignore = await api.path.join(configuration_directory, '.gitignore')
      const configuration_path = await api.path.join(configuration_directory, 'config.json')

      await log.info(`Local configuration established at ${configuration_path}`)

      if (!await api.file.exists(configuration_directory)) {
        api.file.create_directory(configuration_directory)
      }

      if (!await api.file.exists(configuration_gitignore)) {
        await api.file.write(configuration_gitignore, 'config.json\n')
      }

      let data = {}
      const exists = await api.file.exists(configuration_path)

      if (exists) {
        const json = await api.file.contents(configuration_path)
        data = await this.parse(SettingsTarget.Local, json)
        await log.info(`Loaded existing local config.json configuration file at ${configuration_path}`)
      } else {
        await this.write(SettingsTarget.Local)
        await log.info(`Created new local config.json configuration file at ${configuration_path}`)
      }

      for (const key of Object.keys(data)) {
        this.localized[key] = true
      }

      merge(this.$state.local, data)

      await this.present(SettingsTarget.Local)
    },
    reset_local: async function () {
      this.local = SettingsStateDefaults()
      this.localized = LocalizedStateDefaults()
      this.target = SettingsTarget.Global
    },
    parse: async function (target: SettingsTarget, json) {
      const log = fetch_log_store()

      let data = {}
      let parsed = {}

      try {
        parsed = JSON.parse(json)
      } catch {
        await log.error(`Parsing error in ${target} config.json configuration file`)
      }

      try {
        data = SettingsSchema.deepPartial().parse(parsed)
      } catch {
        await log.error(`Schema error in ${target} config.json configuration file`)
      }

      if (!(data instanceof Object)) {
        data = {}
      }

      return data
    },
    view: function (target: SettingsTarget) {
      this.target = target
    },
    localize: async function (path, value) {
      set(this.localized, path, value)

      if (path.indexOf('themes') === 0) {
        await this.present(SettingsTarget.Local)
      }
    },
    set: function (target: SettingsTarget, path, value) {
      switch (target) {
        case SettingsTarget.Global: {
          set(this.global, path, value)
          break
        }

        case SettingsTarget.Local: {
          set(this.local, path, value)
          break
        }
      }
    },
    generate: async function (target: SettingsTarget, passphrase) {
      const { path } = await api.ssl.generate_private_key(passphrase)

      await this.set(target, 'credentials.key', path)
      await this.update(target, 'credentials.passphrase', passphrase)
    },
    update: async function (target: SettingsTarget, path: string, value) {
      this.set(target, path, value)

      if (path.indexOf('themes.light.') === 0) {
        await this.present(target, 'light')
      }

      if (path.indexOf('themes.dark.') === 0) {
        await this.present(target, 'dark')
      }

      await this.write(target)
    },
    write: async function (target: SettingsTarget) {
      switch (target) {
        case SettingsTarget.Global: {
          await this.write_global()
          break
        }

        case SettingsTarget.Local: {
          await this.write_local()
          break
        }
      }
    },
    write_global: async function () {
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      const json = JSON.stringify(this.$state.global)
      await api.file.write(configuration_path, json)
    },
    write_local: async function () {
      const repository = fetch_repository_store()
      const configuration_directory = await api.path.join(repository.path, '.tome')
      const configuration_path = await api.path.join(configuration_directory, 'config.json')

      const enabled = new Set(Object.keys(this.localized).filter((key) => this.localized[key]))
      const config = pickBy(this.$state.local, (value, key) => enabled.has(key))

      const json = JSON.stringify(config)
      await api.file.write(configuration_path, json)
    },
    present: async function (target: SettingsTarget, theme?: string) {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const reconfigure = (target, theme) => {
        let vuetify_theme = theme
        if (target !== SettingsTarget.Active) {
          vuetify_theme = `${theme}-${target}`
        }

        for (const section in palette) {
          for (const color in palette[section]) {
            const key = palette[section][color]
            const value = this[target].themes[theme][section][color]
            if (value !== undefined && value !== '') {
              vuetify.theme.themes.value[vuetify_theme].colors[key] = value
            } else {
              const preset = presets[theme][key]
              if (preset !== undefined && preset !== '') {
                vuetify.theme.themes.value[vuetify_theme].colors[key] = preset
              }
            }
          }
        }
      }

      if (theme === undefined) {
        for (const theme of [ 'light', 'dark' ]) {
          reconfigure(target, theme)
          reconfigure(SettingsTarget.Active, theme)
        }
      } else {
        reconfigure(target, theme)
        reconfigure(SettingsTarget.Active, theme)
      }
    },
  },
})
