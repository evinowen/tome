import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import files from './modules/files'
import search from './modules/search'

export default function () {
  return new Vuex.Store({
    state: {
      tome: {
        name: 'project',
        path: '/project'
      },
      configuration: {
        format_titles: false
      }
    },
    actions: {
      mock: async function (context, data) {
        await context.dispatch('files/mock', data)
        await context.dispatch('search/mock', data)
      }
    },
    modules: {
      files: cloneDeep(files),
      search: cloneDeep(search),
    }
  })
}
