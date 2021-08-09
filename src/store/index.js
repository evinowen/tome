import Vue from 'vue'
import Vuex from 'vuex'

import { DateTime } from 'luxon'
import { remote } from 'electron'

import tome from './modules/tome'
import library from './modules/library'
import files from './modules/files'
import templates from './modules/templates'
import actions from './modules/actions'
import configuration from './modules/configuration'
import clipboard from './modules/clipboard'
import search from './modules/search'

import reporter from './plugins/reporter'
import mediator from './plugins/mediator'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    events: [],
    status: '',
    message: '',
    application_path: '',
    configuration_path: '',
    library_path: ''
  },
  mutations: {
    hydrate: function (state, data) {
      Object.assign(state, data)
    },
    log: function (state, data) {
      const { type, message } = data
      state.status = type
      state.message = message
      state.events.push({
        type,
        message,
        datetime: DateTime.now()
      })
    }
  },
  actions: {
    hydrate: async function (context) {
      const path = remote.require('path')

      const application_path = remote.app.getPath('userData')
      const configuration_path = path.join(application_path, 'config.json')
      const library_path = path.join(application_path, 'library.json')

      await context.dispatch('message', 'Loading...')

      context.commit('hydrate', { application_path, configuration_path, library_path })

      await context.dispatch('configuration/load', context.state.configuration_path)

      await context.dispatch('message', `Configuration established at ${context.state.configuration_path}`)

      await context.dispatch('library/load', context.state.library_path)

      await context.dispatch('message', 'Welcome to Tome')
    },
    message: function (context, message) {
      context.commit('log', { type: 'info', message })
    },
    error: function (context, message) {
      context.commit('log', { type: 'error', message })
    }
  },
  modules: {
    tome,
    library,
    files,
    templates,
    actions,
    configuration,
    clipboard,
    search
  },
  plugins: [
    reporter,
    mediator
  ]
})
