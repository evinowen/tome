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
      const raw = await window.api.file_contents(target)
      const data = JSON.parse(raw) || {}

      await context.dispatch('update', data)
    },
    generate: async function (context, passphrase) {
      const { path: private_key } = await window.api.ssl_generate_private_key(passphrase)

      await context.dispatch('update', { private_key, passphrase })
    },
    update: async function (context, data) {
      context.commit('set', data)

      const { data: public_key } = await window.api.ssl_generate_public_key(
        context.state.private_key,
        context.state.passphrase
      )

      context.commit('set', { public_key })

      await context.dispatch('present')
    },
    write: async function (context, path) {
      await window.api.file_write(path, JSON.stringify(context.state))
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
          Vuetify.framework.theme.themes[theme][color] = default_colors[theme][color]
        }
      }
    }
  }
}
