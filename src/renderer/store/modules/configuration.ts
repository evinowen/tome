import { MutationTree, ActionTree } from 'vuex'
import vuetify from '../../vuetify'

export class State {
  [name: string]: string|boolean

  name: string = ''
  email: string = ''
  private_key: string = ''
  public_key: string = ''
  passphrase: string = ''
  format_titles: boolean = true
  dark_mode: boolean = true
  auto_push: boolean = false
  default_remote: string = 'origin'
  light_primary: string = ''
  light_primary_enabled: boolean = false
  light_secondary: string = ''
  light_secondary_enabled: boolean = false
  light_accent: string = ''
  light_accent_enabled: boolean = false
  light_error: string = ''
  light_error_enabled: boolean = false
  light_info: string = ''
  light_info_enabled: boolean = false
  light_warning: string = ''
  light_warning_enabled: boolean = false
  light_success: string = ''
  light_success_enabled: boolean = false
  dark_primary: string = ''
  dark_primary_enabled: boolean = false
  dark_secondary: string = ''
  dark_secondary_enabled: boolean = false
  dark_accent: string = ''
  dark_accent_enabled: boolean = false
  dark_error: string = ''
  dark_error_enabled: boolean = false
  dark_info: string = ''
  dark_info_enabled: boolean = false
  dark_warning: string = ''
  dark_warning_enabled: boolean = false
  dark_success: string = ''
  dark_success_enabled: boolean = false
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      Object.assign(state, data)
    }
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context, target) {
      const raw = await window.api.file.contents(target)

      let data
      try {
        data = JSON.parse(raw)

        if (!(data instanceof Object)) {
          data = {}
        }
      } catch {
        data = {}
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
      const { path: private_key } = await window.api.ssl.generate_private_key(passphrase)

      await context.dispatch('update', { private_key, passphrase })
    },
    update: async function (context, data) {
      context.commit('set', data)

      const { data: public_key } = await window.api.ssl.generate_public_key(
        context.state.private_key,
        context.state.passphrase
      )

      context.commit('set', { public_key })

      await context.dispatch('present')
    },
    write: async function (context, path) {
      await window.api.file.write(path, JSON.stringify(context.state))
    },
    present: async function (context) {
      vuetify.framework.theme.dark = context.state.dark_mode

      const presets = vuetify.preset.theme.themes

      const colors = [
        'primary',
        'secondary',
        'accent',
        'error',
        'info',
        'warning',
        'success'
      ]

      const theme = vuetify.framework.theme.dark ? 'dark' : 'light'

      for (const color of colors) {
        if (context.state[`${theme}_${color}_enabled`]) {
          vuetify.framework.theme.themes[theme][color] = <string>context.state[`${theme}_${color}`]
        } else {
          vuetify.framework.theme.themes[theme][color] = presets[theme][color]
        }
      }
    }
  }
}
