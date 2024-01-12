import { MutationTree, ActionTree } from 'vuex'
import vuetify, { presets } from '@/vuetify'
import api from '@/api'

export interface State {
  name: string
  email: string
  private_key: string
  public_key: string
  passphrase: string
  format_titles: boolean
  dark_mode: boolean
  auto_push: boolean
  default_remote: string
  light_primary: string
  light_primary_enabled: boolean
  light_secondary: string
  light_secondary_enabled: boolean
  light_accent: string
  light_accent_enabled: boolean
  light_error: string
  light_error_enabled: boolean
  light_info: string
  light_info_enabled: boolean
  light_warning: string
  light_warning_enabled: boolean
  light_success: string
  light_success_enabled: boolean
  dark_primary: string
  dark_primary_enabled: boolean
  dark_secondary: string
  dark_secondary_enabled: boolean
  dark_accent: string
  dark_accent_enabled: boolean
  dark_error: string
  dark_error_enabled: boolean
  dark_info: string
  dark_info_enabled: boolean
  dark_warning: string
  dark_warning_enabled: boolean
  dark_success: string
  dark_success_enabled: boolean
}

export const StateDefaults = (): State => ({
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
  dark_success_enabled: false,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      for (const key in data) {
        Reflect.set(state, key, data[key])
      }
    }
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context, target) {
      let data = {}

      const exists = await api.file.exists(target)

      if (exists) {
        const raw = await api.file.contents(target)

        try {
          data = JSON.parse(raw)

          if (!(data instanceof Object)) {
            data = {}
          }
        } catch {
          await context.dispatch('error', 'Error parsing config.json configuration file', { root: true })
        }

        await context.dispatch('message', `Loaded existing config.json configuration file at ${target}`, { root: true })
      } else {
        await context.dispatch('write', target)
        await context.dispatch('message', `Created new config.json configuration file at ${target}`, { root: true })
      }

      await context.dispatch('update', data)
    },
    read: async function (context, key) {
      switch (key) {
        case 'name':
          return context.state.name
        case 'email':
          return context.state.email
        case 'private_key':
          return context.state.private_key
        case 'public_key':
          return context.state.public_key
        case 'passphrase':
          return context.state.passphrase
        case 'format_titles':
          return context.state.format_titles
        case 'dark_mode':
          return context.state.dark_mode
        case 'auto_push':
          return context.state.auto_push
        case 'default_remote':
          return context.state.default_remote
        case 'light_primary':
          return context.state.light_primary
        case 'light_primary_enabled':
          return context.state.light_primary_enabled
        case 'light_secondary':
          return context.state.light_secondary
        case 'light_secondary_enabled':
          return context.state.light_secondary_enabled
        case 'light_accent':
          return context.state.light_accent
        case 'light_accent_enabled':
          return context.state.light_accent_enabled
        case 'light_error':
          return context.state.light_error
        case 'light_error_enabled':
          return context.state.light_error_enabled
        case 'light_info':
          return context.state.light_info
        case 'light_info_enabled':
          return context.state.light_info_enabled
        case 'light_warning':
          return context.state.light_warning
        case 'light_warning_enabled':
          return context.state.light_warning_enabled
        case 'light_success':
          return context.state.light_success
        case 'light_success_enabled':
          return context.state.light_success_enabled
        case 'dark_primary':
          return context.state.dark_primary
        case 'dark_primary_enabled':
          return context.state.dark_primary_enabled
        case 'dark_secondary':
          return context.state.dark_secondary
        case 'dark_secondary_enabled':
          return context.state.dark_secondary_enabled
        case 'dark_accent':
          return context.state.dark_accent
        case 'dark_accent_enabled':
          return context.state.dark_accent_enabled
        case 'dark_error':
          return context.state.dark_error
        case 'dark_error_enabled':
          return context.state.dark_error_enabled
        case 'dark_info':
          return context.state.dark_info
        case 'dark_info_enabled':
          return context.state.dark_info_enabled
        case 'dark_warning':
          return context.state.dark_warning
        case 'dark_warning_enabled':
          return context.state.dark_warning_enabled
        case 'dark_success':
          return context.state.dark_success
        case 'dark_success_enabled':
          return context.state.dark_success_enabled
      }

      return
    },
    generate: async function (context, passphrase) {
      const { path: private_key } = await api.ssl.generate_private_key(passphrase)

      await context.dispatch('update', { private_key, passphrase })
    },
    update: async function (context, data) {
      context.commit('set', data)

      const { data: public_key } = await api.ssl.generate_public_key(
        context.state.private_key,
        context.state.passphrase
      )

      context.commit('set', { public_key })

      await context.dispatch('present')
    },
    write: async function (context, path) {
      await api.file.write(path, JSON.stringify(context.state))
    },
    present: async function (context) {
      const theme = context.state.dark_mode ? 'dark' : 'light'

      for (const color in presets[theme]) {
        if (context.state[`${theme}_${color}_enabled`]) {
          vuetify.theme.themes.value[theme].colors[color] = <string>context.state[`${theme}_${color}`]
        } else {
          vuetify.theme.themes.value[theme].colors[color] = presets[theme][color]
        }
      }
    }
  }
}
