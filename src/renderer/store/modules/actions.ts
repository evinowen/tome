import { defineStore } from 'pinia'
import { fetch_log_store } from '@/store/log'
import { fetch_files_store } from '@/store/modules/files'
import api from '@/api'

interface FeatureTarget {
  base: string
  absolute: string
  relative: string
}

export type FeatureExecuteInput = { name: string, source: string, target: string, input?: string }

export interface State {
  target: FeatureTarget
  options: string[]
}

export const StateDefaults = (): State => ({
  target: {
    base: '',
    absolute: '',
    relative: '',
  },
  options: [],
})

export const ActionBaseIndex = 'resolve(\'done\')\n'

const create = async (path: string) => {
  const files = fetch_files_store()

  const index_item = await files.create({ path, name: 'index.js' })

  await files.save({ item: index_item, content: ActionBaseIndex })

  await files.select({ item: index_item })
}

const execute = async (data: FeatureExecuteInput) => {
  const log = fetch_log_store()

  const { source, target, input } = data
  const result = await api.action.invoke(source, target, input)

  let error: Error
  if (result.success) {
    const message = `Action ${name} complete${result.message ? `: ${result.message}` : ''}`
    await log.info(message)
  } else {
    const message = `Action ${name} failed${result.message ? `: ${result.message}` : ''}`
    error = new Error(message)
    await log.error(message)
  }

  return { output: result.selection, error }
}

export const fetch_actions_store = defineStore('actions', {
  state: StateDefaults,
  actions: {
    load: async function ({ path }) {
      const absolute = await api.path.join(path, '.tome', 'actions')
      const relative = await api.path.relative(path, absolute)

      const target = <FeatureTarget>{
        base: path,
        absolute,
        relative,
      }

      this.target = target

      const options = await api.file.directory_list(this.target.absolute)

      if (!options || options.length === 0) {
        return
      }

      this.options.length = 0
      this.options.push(...options)
    },
    execute: async function (data) {
      const { name } = data

      if (!this.options.includes(name)) {
        return
      }

      const source = await api.path.join(this.target.absolute, name)

      return await execute({ source, ...data })
    },
    ghost: async function () {
      const files = fetch_files_store()

      await this.prepare()

      const path = this.target.absolute

      // eslint-disable-next-line unicorn/consistent-function-scoping
      const post = async (path: string) => {
        await create(path)
        await this.load({ path: this.target.base })
      }

      await files.haunt({ path, directory: true, post })
    },
    prepare: async function () {
      const files = fetch_files_store()

      const targets = (this.target.relative).split(await api.path.sep())

      let path = this.target.base
      let parent = await files.identify({ path })

      for (const target of targets) {
        if (!parent) {
          throw new Error('Cannot ensure actions feature file structure.')
        }

        path = await api.path.join(path, target)

        const item = await files.identify({ path })

        item
          ? parent = item
          : parent = await files.create({ item: parent, name: target, directory: true })
      }
    },
  },
})
