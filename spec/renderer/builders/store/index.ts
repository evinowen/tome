import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import files from './modules/files'
import search from './modules/search'

export default function () {
  return new Vuex.Store({
    state: {
      repository: {
        name: 'project',
        path: '/project'
      },
      configuration: {
        format_titles: false
      }
    },
    modules: {
      files: cloneDeep(files),
      search: cloneDeep(search)
    }
  })
}
