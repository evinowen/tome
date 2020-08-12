import Vue from 'vue'
import Vuex from 'vuex'

import tome from './modules/tome'
import files from './modules/files'
import templates from './modules/templates'
import configuration from './modules/configuration'
import clipboard from './modules/clipboard'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tome_file: '',
    tome_file_selected: '',
    tome_file_path: '',
    tome_file_data: '',
    tome_file_error: '',
    tome_app_config_path: '',
    tome_app_config_path_dir: ''
  },
  mutations: {
  },
  modules: {
    tome: tome,
    files,
    templates,
    configuration,
    clipboard
  }
})
