import { remote } from 'electron'
import Vuetify from '@/plugins/vuetify'

const default_colors = {}

export default {
  namespaced: true,
  state: {
    name: '',
    email: '',
    private_key: '',
    public_key: '',
    passphrase: '',
    format_titles: true,
    dark_mode: true,
    auto_push: false,
    default_remote: 'origin',
    light_primary: '',
    light_primary_enabled: false,
    light_secondary: '',
    light_secondary_enabled: false,
    light_accent: '',
    light_accent_enabled: false,
    light_error: '',
    light_error_enabled: false,
    light_info: '',
    light_info_enabled: false,
    light_warning: '',
    light_warning_enabled: false,
    light_success: '',
    light_success_enabled: false,
    dark_primary: '',
    dark_primary_enabled: false,
    dark_secondary: '',
    dark_secondary_enabled: false,
    dark_accent: '',
    dark_accent_enabled: false,
    dark_error: '',
    dark_error_enabled: false,
    dark_info: '',
    dark_info_enabled: false,
    dark_warning: '',
    dark_warning_enabled: false,
    dark_success: '',
    dark_success_enabled: false
  },
  mutations: {
    set: function (state, data) {
      for (const item in data) {
        state[item] = data[item]
      }
    }
  },
  actions: {
    load: async function (context, target) {
      const fs = remote.require('fs')
      const raw = await new Promise((resolve, reject) =>
        fs.readFile(
          target,
          'utf8',
          (err, data) => err ? reject(err) : resolve(data)
        )
      )

      const data = JSON.parse(raw) || {}

      context.commit('set', data)

      await context.dispatch('present')
    },
    update: async function (context, data) {
      context.commit('set', data)

      await context.dispatch('present')
    },
    write: async function (context, path) {
      const fs = remote.require('fs')
      await new Promise((resolve, reject) =>
        fs.writeFile(
          path,
          JSON.stringify(context.state),
          'utf8',
          (err) => err ? reject(err) : resolve()
        )
      )
    },
    present: async function (context) {
      Vuetify.framework.theme.dark = context.state.dark_mode

      if (!Vuetify.framework.theme.dark && !default_colors.light) {
        const colors = Vuetify.framework.theme.themes.light
        default_colors.light = {}
        for (const color in colors) {
          default_colors.light[color] = colors[color]
        }
      }

      if (Vuetify.framework.theme.dark && !default_colors.dark) {
        const colors = Vuetify.framework.theme.themes.dark
        default_colors.dark = {}
        for (const color in colors) {
          default_colors.dark[color] = colors[color]
        }
      }

      const colors = [
        'primary',
        'secondary',
        'accent',
        'error',
        'info',
        'warning',
        'success'
      ]

      const theme = Vuetify.framework.theme.dark ? 'dark' : 'light'

      for (const color of colors) {
        if (context.state[`${theme}_${color}_enabled`]) {
          Vuetify.framework.theme.themes[theme][color] = context.state[`${theme}_${color}`]
        } else {
          Vuetify.framework.theme.themes.[theme][color] = default_colors[theme][color]
        }
      }
    }
  }
}
