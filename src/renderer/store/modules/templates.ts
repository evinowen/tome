import { ActionContext } from 'vuex'
import factory, { State as FactoryState } from '../factories/feature'

export type State = FactoryState

export const TemplateBaseConfiguration = {
  directory: false,
  map: {
    'index.md': 'index.md'
  }
}

export const TemplateBaseIndex = '# New Template\n'

const create = (context: ActionContext<State, any>) => async (path: string) => {
  const config_item = await context.dispatch('files/create', { path, name: 'config.json' }, { root: true })
  const config_content = `${JSON.stringify(TemplateBaseConfiguration, null, 2)}\n`
  await context.dispatch('files/save', { item: config_item, content: config_content }, { root: true })
  await context.dispatch('files/select', { item: config_item }, { root: true })

  const index_item = await context.dispatch('files/create', { path, name: 'index.md' }, { root: true })
  await context.dispatch('files/save', { item: index_item, content: TemplateBaseIndex }, { root: true })
  await context.dispatch('files/select', { item: index_item }, { root: true })

  await context.dispatch('load', { path: context.state.target.base })
}

const execute = (context: ActionContext<State, any>) => async (data: { name: string, source: string, target: string, selection: string }) => {
  const { source, target, selection } = data
  const { success, result = null } = await window.api.template.invoke(source, target)

  if (success) {
    if (result) {
      await context.dispatch('files/load', { path: target }, { root: true })
      await context.dispatch('files/select', { path: result }, { root: true })
    }

    await context.dispatch('message', `Template ${name} complete`, { root: true })

    return result
  } else {
    await context.dispatch('error', `Template ${name} failed: ${result}`, { root: true })
  }
}

export default factory('templates', create, execute)
