import { defineStore } from 'pinia'
import { fetch_files_store } from '@/store/modules/files'

export interface State {
  readme: string
  license: string
  authors: string
  contributors: string
}

export const StateDefaults = (): State => ({
  readme: '',
  license: '',
  authors: '',
  contributors: '',
})

export const fetch_repository_metadata_store = defineStore('repository-metadata', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const files = fetch_files_store()
      const tree = files.tree

      const patterns = {
        readme: /^readme(\.md|\.txt)?$/i,
        license: /^license(\.md|\.txt)?$/i,
        authors: /^authors(\.md|\.txt)?$/i,
        contributors: /^contributors(\.md|\.txt)?$/i,
      }

      for (const file of tree.base.children) {
        for (const type in patterns) {
          const regex = patterns[type]
          if (regex.test(file.name)) {
            this[type] = file.path
          }
        }
      }
    },
  },
})
