import { defineStore } from 'pinia'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import api from '@/api'

export interface State {
  path: string
  history: string[]
}

export const StateDefaults = (): State => ({
  path: '',
  history: [],
})

export const fetch_library_store = defineStore('library', {
  state: StateDefaults,
  actions: {
    load: async function (path) {
      const history = []

      if (await api.file.exists(path)) {
        const raw = await api.file.contents(path)

        if (raw) {
          const lines = raw.split(/[\n\r]+/).map((line) => line.trim())

          for (const line of lines) {
            if (line !== '') {
              history.push(line)
            }
          }
        }
      }

      this.path = path
      this.history.push(...history)
    },
    select: async function () {
      const result = await api.file.select_directory()

      if (result.canceled) {
        return
      }

      const path = result.filePaths.shift()
      await this.open(path)
    },
    open: async function (path) {
      await this.add(path)

      const repository = fetch_repository_store()
      await repository.open(path)

      const files = fetch_files_store()
      await files.initialize({ path })

      const repository_committer = fetch_repository_committer_store()
      await repository_committer.inspect()
    },
    close: async function () {
      const repository = fetch_repository_store()
      await repository.clear()

      const files = fetch_files_store()
      await files.clear()
    },
    add: async function (path) {
      const index = this.history.indexOf(path)

      if (index < 0) {
        this.history.push(path)
      }

      await this.record()
    },
    remove: async function (path) {
      const index = this.history.indexOf(path)

      if (index >= 0) {
        this.history.splice(index, 1)
      }

      await this.record()
    },
    record: async function () {
      await api.file.write_library(this.path, [ ...this.history ])
    },
  },
})
