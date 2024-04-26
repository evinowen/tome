import { z, ZodError } from 'zod'
import { MutationTree, ActionTree } from 'vuex'
import vuetify, { presets } from '@/vuetify'
import api from '@/api'
import palette from '@/palette'
import themes, { Schema as ThemesSchema, State as ThemesState } from './themes'

export const Schema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),

  private_key: z.string().optional(),
  public_key: z.string().optional(),
  passphrase: z.string().optional(),

  default_remote: z.string().optional(),
  auto_push: z.boolean().optional(),

  format_titles: z.boolean().optional(),
  dark_mode: z.boolean().optional(),
  line_numbers: z.boolean().optional(),

  themes: ThemesSchema.optional(),
})

export interface State {
  name: string
  email: string

  private_key: string
  public_key: string
  passphrase: string

  default_remote: string
  auto_push: boolean

  format_titles: boolean
  dark_mode: boolean
  line_numbers: boolean

  themes?: ThemesState
}

export const StateDefaults = (): State => ({
  name: '',
  email: '',

  private_key: '',
  public_key: '',
  passphrase: '',

  default_remote: 'origin',
  auto_push: false,

  format_titles: true,
  dark_mode: false,
  line_numbers: false,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      for (const key in data) {
        Reflect.set(state, key, data[key])
      }
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      await context.dispatch('message', `Configuration established at ${configuration_path}`, { root: true })

      let data = {}

      const exists = await api.file.exists(configuration_path)

      if (exists) {
        const raw = await api.file.contents(configuration_path)

        let parsed = {}

        try {
          parsed = JSON.parse(raw)
        } catch {
          await context.dispatch('error', 'Parsing error in config.json configuration file', { root: true })
        }

        try {
          data = Schema.parse(parsed)
        } catch {
          await context.dispatch('error', 'Schema error in config.json configuration file', { root: true })
        }

        await context.dispatch('message', `Loaded existing config.json configuration file at ${configuration_path}`, { root: true })
      } else {
        await context.dispatch('write')
        await context.dispatch('message', `Created new config.json configuration file at ${configuration_path}`, { root: true })
      }

      if (!(data instanceof Object)) {
        data = {}
      }

      for (const index in data) {
        const datum = data[index]
        if (datum instanceof Object) {
          await context.dispatch(`${index}/hydrate`, datum)
        } else {
          context.commit('set', { [index]: datum })
        }
      }

      context.dispatch('present')
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
        context.state.passphrase,
      )

      context.commit('set', { public_key })

      await context.dispatch('present')
      await context.dispatch('write')
    },
    write: async function (context) {
      const application_path = await api.app.getPath('userData')
      const configuration_path = await api.path.join(application_path, 'config.json')

      const json = JSON.stringify(context.state)
      await api.file.write(configuration_path, json)
    },
    present: async function (context) {
      const theme = context.state.dark_mode ? 'dark' : 'light'
      for (const section in palette) {
        for (const color in palette[section]) {
          const key = palette[section][color]
          const value = context.state.themes[theme][section][color]
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
  modules: {
    themes,
  },
}
