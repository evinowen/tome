import { defineStore } from 'pinia'
import { merge } from 'lodash'
import vuetify, { presets } from '@/vuetify'
import api from '@/api'
import palette from '@/palette'
import Schema from '@/schema/configuration'
import { fetch_log_store } from '@/store/log'
import StateDefaults from '@/store/state/configuration'
// export { default as StateDefaults, State } from '@/store/state/configuration'

export const fetch_configuration_store = defineStore('configuration', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const log = fetch_log_store()
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      await log.info(`Configuration established at ${configuration_path}`)

      let data = {}
      const exists = await api.file.exists(configuration_path)

      if (exists) {
        const raw = await api.file.contents(configuration_path)

        let parsed = {}

        try {
          parsed = JSON.parse(raw)
        } catch {
          await log.error('Parsing error in config.json configuration file')
        }

        try {
          data = Schema.deepPartial().parse(parsed)
        } catch {
          await log.error('Schema error in config.json configuration file')
        }

        await log.info(`Loaded existing config.json configuration file at ${configuration_path}`)
      } else {
        await this.write()
        await log.info(`Created new config.json configuration file at ${configuration_path}`)
      }

      if (!(data instanceof Object)) {
        data = {}
      }

      merge(this.$state, data)

      await this.present()
    },
    read: async function (key) {
      const recurse_state = (object: Object, indices: string[]) => {
        const index = indices[0]
        let value = object[index]

        if (indices.length > 1) {
          value = recurse_state(value, indices.slice(1, indices.length))
        }

        return value
      }

      return recurse_state(this, key.split('.'))
    },
    set: function (data) {
      merge(this, data)
    },
    generate: async function (passphrase) {
      const { path: private_key } = await api.ssl.generate_private_key(passphrase)

      await this.update({ private_key, passphrase })
    },
    update: async function (data) {
      this.set(data)

      const { data: public_key } = await api.ssl.generate_public_key(
        this.private_key,
        this.passphrase,
      )

      await this.set({ public_key })

      await this.present()
      await this.write()
    },
    write: async function () {
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      const json = JSON.stringify(this.$state)
      await api.file.write(configuration_path, json)
    },
    present: async function () {
      const theme = this.dark_mode ? 'dark' : 'light'
      for (const section in palette) {
        for (const color in palette[section]) {
          const key = palette[section][color]
          const value = this.themes[theme][section][color]
          if (value !== undefined && value !== '') {
            vuetify.theme.themes.value[theme].colors[key] = value
          } else {
            const preset = presets[theme][key]
            if (preset !== undefined && preset !== '') {
              vuetify.theme.themes.value[theme].colors[key] = preset
            }
          }
        }
      }
    },
  },
})
