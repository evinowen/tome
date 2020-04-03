import Vue from 'vue'
import Vuex from 'vuex'

import tome from './modules/tome'
import configuration from './modules/configuration'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tome_config: null,
    tome_file: '',
    tome_file_selected: '',
    tome_file_path: '',
    tome_file_data: '',
    tome_file_error: '',
    tome_file_actions: null,
    tome_file_actions_root: null,
    tome_app_config_path: '',
    tome_app_config_path_dir: ''
  },
  mutations: {
  },
  modules: {
    tome: tome,
    configuration
  }
})
