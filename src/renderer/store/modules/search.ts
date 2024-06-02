import { defineStore } from 'pinia'
import api from '@/api'

interface SearchResult {
  path: undefined | {
    absolute: string
    relative: string
    matched: number
  }
  directory: boolean
  matches: { index: number, line: string }[]
}

export class State {
  status?: string
  path?: string
  query?: string
  multifile: boolean
  regex_query: boolean
  case_sensitive: boolean
  results: SearchResult[]
  navigation: { target: number, total: number }
}

export const StateDefaults = (): State => ({
  status: '',
  path: '',
  query: '',
  multifile: false,
  regex_query: false,
  case_sensitive: false,
  results: [],
  navigation: { target: 1, total: 0 },
})

export const fetch_search_store = defineStore('search', {
  state: StateDefaults,
  actions: {
    flags: async function (flags) {
      const { multifile, regex_query, case_sensitive } = flags

      if (typeof multifile === 'boolean') {
        this.multifile = multifile
      }

      if (typeof regex_query === 'boolean') {
        this.regex_query = regex_query
      }

      if (typeof case_sensitive === 'boolean') {
        this.case_sensitive = case_sensitive
      }
    },
    clear: async function () {
      this.query = undefined
      this.results = []
    },
    execute: async function ({ path = '', query = '' } = {}) {
      this.path = path
      this.query = query

      if (!this.path) {
        return
      }

      if (!this.multifile) {
        return
      }

      this.results.length = 0

      if (!this.query) {
        return
      }

      const target = this.path
      const criteria = {
        query: this.query,
        multifile: this.multifile,
        regex_query: this.regex_query,
        case_sensitive: this.case_sensitive,
      }

      await api.file.search_path(target, criteria)

      for (;;) {
        const result = await api.file.search_next()

        if (result === undefined || result.path === undefined) {
          break
        }

        if (!this.multifile) {
          break
        }

        if (target !== this.path) {
          break
        }

        if ('query' in criteria && criteria.query !== this.query) {
          break
        }

        if ('multifile' in criteria && criteria.multifile !== this.multifile) {
          break
        }

        if ('regex_query' in criteria && criteria.regex_query !== this.regex_query) {
          break
        }

        if ('case_sensitive' in criteria && criteria.case_sensitive !== this.case_sensitive) {
          break
        }

        if (result.path.matched > -1 || result.matches.length > 0) {
          this.results.push(result)
        }
      }
    },
    navigate: async function ({ total, target }) {
      this.navigation.target = Number.isInteger(target) ? target : this.navigation.target
      this.navigation.total = Number.isInteger(total) ? total : this.navigation.total

      if (this.navigation.target < 1) {
        this.navigation.target = this.navigation.total
      } else if (this.navigation.target > this.navigation.total) {
        this.navigation.target = 1
      }
    },
    next: async function () {
      this.navigate({ target: this.navigation.target + 1, total: undefined })
    },
    previous: async function () {
      this.navigate({ target: this.navigation.target - 1, total: undefined })
    },
  },
})
