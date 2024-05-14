import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import files from './modules/files'
import search from './modules/search'
import { vi } from 'vitest'

export default function () {
  return new Vuex.Store({
    state: {
      repository: {
        name: 'project',
        path: '/project',
      },
      configuration: {
        format_explorer_titles: false,
      },
    },
    modules: {
      files: cloneDeep(files),
      search: cloneDeep(search),
    },
  })
}

export function scafold (config) {
  return cloneDeep({
    actions: {
      log: vi.fn(),
    },
    ...config,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stub_actions (list: (string | Record<string, any>)[]) {
  const result = {}

  for (const item of list) {
    if (typeof item === 'string') {
      result[item] = vi.fn(() => { /* Empty */ })
    } else if (typeof item === 'object') {
      for (const key of Object.keys(item)) {
        result[key] = vi.fn(item[key])
      }
    }
  }

  return result
}
