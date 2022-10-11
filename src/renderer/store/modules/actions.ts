import { ActionContext } from 'vuex'
import factory, { State as FactoryState } from '../factories/feature'

export const ActionBaseIndex = 'resolve(\'done\')\n'

export type State = FactoryState

const create = (context: ActionContext<State, any>) => async (path: string) => {
  const index_item = await context.dispatch('files/create', { path, name: 'index.js' }, { root: true })

  await context.dispatch('files/save', { item: index_item, content: ActionBaseIndex }, { root: true })

  await context.dispatch('files/select', { item: index_item }, { root: true })

  await context.dispatch('load', { path: context.state.target.base })
}

const execute = (context: ActionContext<State, any>) => async (data: { name: string, source: string, target: string, selection: string }) => {
  const { source, target, selection } = data
  const result = await window.api.action.invoke(source, target, selection)

  if (result.success) {
    const message = `Action ${name} complete${result.message ? `: ${result.message}` : ''}`
    await context.dispatch('message', message, { root: true })

    return result
  } else {
    const message = `Action ${name} failed${result.message ? `: ${result.message}` : ''}`
    await context.dispatch('error', message, { root: true })
  }
}

export default factory('actions', create, execute)
