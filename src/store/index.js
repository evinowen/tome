import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const tome = {
  state: {
    name: '',
    path: '',
    repository: null,
    branch: {
      name: '',
      error: ''
    },
    status: {
      staged: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0
      },
      available: {
        new: 0,
        renamed: 0,
        modified: 0,
        deleted: 0
      }
    }
  },
  mutations: {
  },
  actions: {
  }
}

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
    tome_ready: false,
    tome_app_config_path: '',
    tome_app_config_path_dir: ''
  },
  mutations: {
  },
  modules: {
    tome: tome
  }
})
