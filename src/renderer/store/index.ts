import { InjectionKey } from 'vue'
import { createStore, useStore, Store, MutationTree, ActionTree } from 'vuex'
export { Store } from 'vuex'

import { DateTime } from 'luxon'

import api from '@/api'
import actions, { State as ActionsState } from './modules/actions'
import clipboard, { State as CliboardState } from './modules/clipboard'
import configuration, { State as ConfigurationState } from './modules/configuration'
import context, { State as ContextState } from './modules/context'
import error, { State as ErrorState } from './modules/error'
import files, { State as FilesState } from './modules/files'
import fonts, { State as FontsState } from './modules/fonts'
import input, { State as InputState } from './modules/input'
import library, { State as LibraryState } from './modules/library'
import repository, { State as RepositoryState } from './modules/repository'
import search, { State as SearchState } from './modules/search'
import system, { State as SystemState } from './modules/system'
import templates, { State as TemplatesState } from './modules/templates'
import validation, { State as ValidationState } from './modules/validation'

import reporter from './plugins/reporter'
import mediator from './plugins/mediator'

export { File } from './modules/files'

export interface State {
  events?: { level: string, message: string, stack: string, datetime: DateTime }[]
  stages?: string[]
  status?: string
  message?: string
  application_path?: string
  configuration_path?: string
  library_path?: string

  actions?: ActionsState
  clipboard?: CliboardState
  configuration?: ConfigurationState
  context?: ContextState
  error?: ErrorState
  files?: FilesState
  fonts?: FontsState
  input?: InputState
  library?: LibraryState
  repository?: RepositoryState
  search?: SearchState
  system?: SystemState
  templates?: TemplatesState
  validation?: ValidationState
}

export const StateDefaults = (): State => ({
  events: [],
  stages: [],
  status: '',
  message: '',
  application_path: '',
  configuration_path: '',
  library_path: '',
})

export const key: InjectionKey<Store<State>> = Symbol()

enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

const LogLevelOrder = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
]

export function build_store () {
  return createStore<State>({
    state: StateDefaults,
    mutations: <MutationTree<State>>{
      hydrate: function (state, data) {
        Object.assign(state, data)
      },
      stage: function (state, stage) {
        state.stages.push(stage)
      },
      log: function (state, data) {
        const { level, message, stack = '' } = data
        state.status = level
        state.message = message
        state.events.push({
          level,
          message,
          stack,
          datetime: DateTime.now(),
        })
      },
    },
    actions: <ActionTree<State, unknown>>({
      hydrate: async function (context) {
        const application_path = await api.app.getPath('userData')
        const configuration_path = await api.path.join(application_path, 'config.json')
        const library_path = await api.path.join(application_path, 'library.json')

        await context.dispatch('log', { level: 'trace', message: 'Loading...' })

        context.commit('hydrate', { application_path, configuration_path, library_path })

        await context.dispatch('system/load')

        await context.dispatch('log', { level: 'debug', message: `Configuration established at ${context.state.configuration_path}` })
        await context.dispatch('configuration/load', context.state.configuration_path)

        await context.dispatch('log', { level: 'debug', message: `Library established at ${context.state.library_path}` })
        await context.dispatch('library/load', context.state.library_path)

        await context.dispatch('log', { level: 'debug', message: 'Loading all Fonts' })
        for (const fontface of document.fonts) {
          await fontface.load()
        }
        await context.dispatch('present', 'fonts')

        await context.dispatch('log', { level: 'info', message: 'Welcome to Tome' })
      },
      present: async function (context, stage) {
        context.commit('stage', stage)

        if (!context.state.stages.includes('application')) {
          return
        }

        if (!context.state.stages.includes('fonts')) {
          return
        }

        api.initalize.ready()
      },
      log: function (context, detail) {
        const { level, message, stack } = detail

        const threshold = LogLevelOrder.indexOf(context.state.configuration.log_level || LogLevel.Info)
        const priority = LogLevelOrder.indexOf(level)

        if (priority < threshold) {
          return
        }

        context.commit('log', { level, message, stack })

        switch (level) {
          case LogLevel.Trace:
            api.log.trace(message)
            break

          case LogLevel.Debug:
            api.log.debug(message)
            break

          case LogLevel.Info:
            api.log.info(message)
            break

          case LogLevel.Warn:
            api.log.warn(message)
            break

          case LogLevel.Error:
            api.log.error(message)
            break

          case LogLevel.Fatal:
            api.log.fatal(message)
            break
        }
      },
    }),
    modules: {
      actions,
      clipboard,
      configuration,
      context,
      error,
      files,
      fonts,
      input,
      library,
      repository,
      search,
      system,
      templates,
      validation,
    },
    plugins: [
      reporter,
      mediator,
      (store) => {
        store.watch((state) => state.configuration.log_level, async (log_level) => {
          await api.log.configure(log_level)
        })
      },
    ],
  })
}

export function fetchStore () {
  return useStore(key)
}

export const store = build_store()

export default store
