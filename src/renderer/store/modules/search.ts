import { MutationTree, ActionTree } from 'vuex'

interface SearchResult {
  path: null|{
    absolute: string,
    relative: string,
    matched: number
  },
  directory: boolean,
  matches: { index: number, line: string }[]
}

export class State {
  status: string|null = ''
  path: string|null = null
  query: string|null = ''
  multifile = false
  regex_query = false
  case_sensitive = false
  results: SearchResult[] = []
  navigation: { target: number, total: number } = { target: 1, total: 0}
}

export default {
  namespaced: true,
  state: new State(),
  mutations: <MutationTree<State>>{
    clear: function (state) {
      state.query = null
      state.results = []
    },
    multifile: function (state, value) {
      state.multifile = value
    },
    regex_query: function (state, value) {
      state.regex_query = value
    },
    case_sensitive: function (state, value) {
      state.case_sensitive = value
    },
    query: function (state, { path, query }) {
      state.path = path
      state.query = query
    },
    reset: function (state) {
      state.results.length = 0
    },
    result: function (state, result) {
      state.results.push(result)
    },
    navigate: function (state, { target, total }) {
      state.navigation.target = Number.isInteger(target) ? target : state.navigation.target
      state.navigation.total = Number.isInteger(total) ? total : state.navigation.total

      if (state.navigation.target < 1) {
        state.navigation.target = state.navigation.total
      } else if (state.navigation.target > state.navigation.total) {
        state.navigation.target = 1
      }
    }
  },
  actions: <ActionTree<State, any>>{
    multifile: async function (context, value) {
      context.commit('multifile', value)
    },
    regex_query: async function (context, value) {
      context.commit('regex_query', value)
    },
    case_sensitive: async function (context, value) {
      context.commit('case_sensitive', value)
    },
    query: async function (context, { path, query }) {
      context.commit('query', { path, query })
      await context.dispatch('execute')
    },
    clear: async function (context) {
      context.commit('clear')
    },
    execute: async function (context) {
      if (!context.state.path) {
        return
      }

      if (!context.state.multifile) {
        return
      }

      context.commit('reset')

      if (!context.state.query) {
        return
      }

      const target = context.state.path
      const criteria = {
        query: context.state.query,
        multifile: context.state.multifile,
        regex_query: context.state.regex_query,
        case_sensitive: context.state.case_sensitive
      }

      await window.api.file.search_path(target, criteria)

      const loop = true
      while (loop) {
        const result = await window.api.file.search_next()

        if (result === null || result.path === null) {
          break
        }

        if (!context.state.multifile) {
          break
        }

        if (target !== context.state.path) {
          break
        }

        if ('query' in criteria && criteria.query !== context.state.query) {
          break
        }

        if ('multifile' in criteria && criteria.multifile !== context.state.multifile) {
          break
        }

        if ('regex_query' in criteria && criteria.regex_query !== context.state.regex_query) {
          break
        }

        if ('case_sensitive' in criteria && criteria.case_sensitive !== context.state.case_sensitive) {
          break
        }

        if (result.path.matched > -1 || result.matches.length > 0) {
          context.commit('result', result)
        }
      }
    },
    navigate: async function (context, { total, target }) {
      context.commit('navigate', { total, target })
    },
    next: async function (context) {
      context.commit('navigate', { target: context.state.navigation.target + 1, total: null })
    },
    previous: async function (context) {
      context.commit('navigate', { target: context.state.navigation.target - 1, total: null })
    }
  }
}
