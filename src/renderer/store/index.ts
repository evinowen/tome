import { InjectionKey } from 'vue'
import { createStore, useStore, Store, MutationTree, ActionTree } from 'vuex'

import { DateTime } from 'luxon'

import repository, { State as RepositoryState } from './modules/repository'
import library, { State as LibraryState } from './modules/library'
import files, { State as FilesState } from './modules/files'
import system, { State as SystemState } from './modules/system'
import templates, { State as TemplatesState }from './modules/templates'
import actions, { State as ActionsState } from './modules/actions'
import configuration, { State as ConfigurationState } from './modules/configuration'
import context, { State as ContextState } from './modules/context'
import clipboard , { State as CliboardState }from './modules/clipboard'
import search, { State as SearchState } from './modules/search'

import reporter from './plugins/reporter'
import mediator from './plugins/mediator'

export interface State {
  events: { type: string, message: string, stack: string, datetime: DateTime }[]
  status: string
  message: string
  application_path: string
  configuration_path: string
  library_path: string

  repository: RepositoryState
  library: LibraryState
  files: FilesState
  system: SystemState
  templates: TemplatesState
  actions: ActionsState
  configuration: ConfigurationState
  context: ContextState
  clipboard: CliboardState
  search: SearchState
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore({
  state: {
    events: [],
    status: '',
    message: '',
    application_path: '',
    configuration_path: '',
    library_path: ''
  } as unknown as State,
  mutations: <MutationTree<State>>{
    hydrate: function (state, data) {
      Object.assign(state, data)
    },
    log: function (state, data) {
      const { type, message, stack } = data
      state.status = type
      state.message = message
      state.events.push({
        type,
        message,
        stack,
        datetime: DateTime.now()
      })
    }
  },
  actions: <ActionTree<State, unknown>>({
    hydrate: async function (context) {
      const application_path = await window.api.app.getPath('userData')
      const configuration_path = await window.api.path.join(application_path, 'config.json')
      const library_path = await window.api.path.join(application_path, 'library.json')

      await context.dispatch('message', 'Loading...')

      context.commit('hydrate', { application_path, configuration_path, library_path })

      await context.dispatch('system/load')
      await context.dispatch('configuration/load', context.state.configuration_path)

      await context.dispatch('message', `Configuration established at ${context.state.configuration_path}`)

      await context.dispatch('library/load', context.state.library_path)

      await context.dispatch('message', 'Welcome to Tome')
    },
    message: function (context, message) {
      window.api.log.info(message)

      context.commit('log', { type: 'info', message })
    },
    error: function (context, error) {
      window.api.log.error(error)

      if (error instanceof Error) {
        context.commit('log', { type: 'error', message: error.message, stack: error.stack })
      } else {
        context.commit('log', { type: 'error', message: String(error) })
      }
    }
  }),
  modules: {
    repository,
    library,
    files,
    templates,
    actions,
    configuration,
    context,
    clipboard,
    search,
    system
  },
  plugins: [
    reporter,
    mediator
  ]
})

export function fetchStore () {
  return useStore(key)
}

export default store
