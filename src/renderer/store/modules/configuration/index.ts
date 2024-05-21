import { z } from 'zod'
import { MutationTree, ActionTree } from 'vuex'
import vuetify, { presets } from '@/vuetify'
import api from '@/api'
import palette from '@/palette'
import themes, { Schema as ThemesSchema, State as ThemesState } from './themes'

export const Schema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),

  credential_type: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  private_key: z.string().optional(),
  public_key: z.string().optional(),
  passphrase: z.string().optional(),

  default_remote: z.string().optional(),
  auto_commit: z.boolean().optional(),
  auto_commit_interval: z.string().optional(),
  auto_push: z.boolean().optional(),

  format_explorer_titles: z.boolean().optional(),
  format_interaction_titles: z.boolean().optional(),

  system_objects: z.boolean().optional(),
  draggable_objects: z.boolean().optional(),
  dark_mode: z.boolean().optional(),
  line_numbers: z.boolean().optional(),

  explorer_position: z.string().optional(),
  explorer_width: z.number().optional(),
  explorer_resize_width: z.number().optional(),

  search_opacity: z.number().optional(),
  search_height: z.number().optional(),
  search_resize_height: z.number().optional(),

  log_level: z.string().optional(),

  themes: ThemesSchema.optional(),
})

export interface State {
  name: string
  email: string

  credential_type: string
  username: string
  password: string
  private_key: string
  public_key: string
  passphrase: string

  default_remote: string
  auto_commit: boolean
  auto_commit_interval: string
  auto_push: boolean

  format_explorer_titles: boolean
  format_interaction_titles: boolean
  system_objects: boolean
  draggable_objects: boolean
  dark_mode: boolean
  line_numbers: boolean

  explorer_position: string
  explorer_width: number
  explorer_resize_width: number

  search_opacity: number
  search_height: number
  search_resize_height: number

  log_level: string

  themes?: ThemesState
}

export const StateDefaults = (): State => ({
  name: '',
  email: '',

  credential_type: 'key',
  username: '',
  password: '',
  private_key: '',
  public_key: '',
  passphrase: '',

  default_remote: 'origin',
  auto_commit: false,
  auto_commit_interval: 'hourly',
  auto_push: false,

  format_explorer_titles: true,
  format_interaction_titles: true,
  system_objects: false,
  draggable_objects: true,
  dark_mode: false,
  line_numbers: false,

  explorer_position: 'left',
  explorer_width: 320,
  explorer_resize_width: 3,

  search_opacity: 100,
  search_height: 240,
  search_resize_height: 3,

  log_level: 'info',
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

      await context.dispatch('log', { level: 'info', message: `Configuration established at ${configuration_path}` }, { root: true })

      let data = {}
      const exists = await api.file.exists(configuration_path)

      if (exists) {
        const raw = await api.file.contents(configuration_path)

        let parsed = {}

        try {
          parsed = JSON.parse(raw)
        } catch {
          await context.dispatch('log', { level: 'error', message: 'Parsing error in config.json configuration file' }, { root: true })
        }

        try {
          data = Schema.parse(parsed)
        } catch {
          await context.dispatch('log', { level: 'error', message: 'Schema error in config.json configuration file' }, { root: true })
        }

        await context.dispatch('log', { level: 'info', message: `Loaded existing config.json configuration file at ${configuration_path}` }, { root: true })
      } else {
        await context.dispatch('write')
        await context.dispatch('log', { level: 'info', message: `Created new config.json configuration file at ${configuration_path}` }, { root: true })
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
      const recurse_state = (object: Object, indices: string[]) => {
        const index = indices[0]
        let value = object[index]

        if (indices.length > 1) {
          value = recurse_state(value, indices.slice(1, indices.length))
        }

        return value
      }

      return recurse_state(context.state, key.split('.'))
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
