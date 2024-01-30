import { MutationTree, ActionTree, ActionContext } from 'vuex'
import api from '@/api'

interface FeatureTarget {
  base: string
  absolute: string
  relative: string
}

export type FeatureCreateFunction = (context: ActionContext<State, unknown>) => (path: string) => Promise<void>
export type FeatureExecuteFunction<T> = (context: ActionContext<State, unknown>) => (data: FeatureExecuteInput) => Promise<T>
export type FeatureExecuteInput = { name: string, source: string, target: string, selection?: string }

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

export default <T>(feature: string, create: FeatureCreateFunction, execute: FeatureExecuteFunction<T>) => ({
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    target: function (state, target) {
      state.target = target
    },
    options: function (state, options) {
      state.options.length = 0
      state.options.push(...options)
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context, { path }) {
      const absolute = await api.path.join(path, '.tome', feature)
      const relative = await api.path.relative(path, absolute)

      const target = <FeatureTarget>{
        base: path,
        absolute,
        relative,
      }

      context.commit('target', target)

      const options = await api.file.directory_list(context.state.target.absolute)

      if (!options || options.length === 0) {
        return
      }

      context.commit('options', options)
    },
    execute: async function (context, data) {
      const { name } = data

      if (!context.state.options.includes(name)) {
        return
      }

      const source = await api.path.join(context.state.target.absolute, name)

      return await (execute(context))({ source, ...data })
    },
    ghost: async function (context) {
      await context.dispatch('prepare')

      const path = context.state.target.absolute

      await context.dispatch('files/ghost', { path, directory: true, post: create(context) }, { root: true })
    },
    prepare: async function (context) {
      const targets = (context.state.target.relative).split(await api.path.sep())

      let path = context.state.target.base
      let parent = await context.dispatch('files/identify', { path }, { root: true })

      for (const target of targets) {
        if (!parent) {
          throw new Error(`Cannot ensure ${feature} feature file structure.`)
        }

        path = await api.path.join(path, target)

        const item = await context.dispatch('files/identify', { path }, { root: true })

        item
          ? parent = item
          : parent = await context.dispatch('files/create', { item: parent, name: target, directory: true }, { root: true })
      }
    },
  },
})
