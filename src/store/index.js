import Vue from 'vue'
import Vuex from 'vuex'

import { remote } from 'electron'

import tome from './modules/tome'
import files from './modules/files'
import templates from './modules/templates'
import actions from './modules/actions'
import configuration from './modules/configuration'
import clipboard from './modules/clipboard'
import search from './modules/search'

import mediator from './plugins/mediator'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    application_path: '',
    configuration_path: ''
  },
  mutations: {
    hydrate: function (state, data) {
      Object.assign(state, data)
    }
  },
  actions: {
    hydrate: async function (context) {
      const path = remote.require('path')

      const application_path = remote.app.getPath('userData')
      const configuration_path = path.join(application_path, 'config.json')

      context.commit('hydrate', { application_path, configuration_path })
      await context.dispatch('configuration/load', context.state.configuration_path)
    }
  },
  modules: {
    tome: tome,
    files,
    templates,
    actions,
    configuration,
    clipboard,
    search
  },
  plugins: [
    mediator
  ]
})
