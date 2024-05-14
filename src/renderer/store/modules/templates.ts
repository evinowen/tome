import { ActionContext } from 'vuex'
import api from '@/api'
import factory, {
  State as FactoryState,
  FeatureExecuteInput,
} from '../factories/feature'

export type State = FactoryState
export { StateDefaults } from '../factories/feature'

export const TemplateBaseConfiguration = {
  directory: false,
  map: {
    'index.md': 'index.md',
  },
}

export const TemplateBaseIndex = '# New Template\n'

const create = (context: ActionContext<State, unknown>) => async (path: string) => {
  const config_item = await context.dispatch('files/create', { path, name: 'config.json' }, { root: true })
  const config_content = `${JSON.stringify(TemplateBaseConfiguration, undefined, 2)}\n`
  await context.dispatch('files/save', { item: config_item, content: config_content }, { root: true })
  await context.dispatch('files/select', { item: config_item }, { root: true })

  const index_item = await context.dispatch('files/create', { path, name: 'index.md' }, { root: true })
  await context.dispatch('files/save', { item: index_item, content: TemplateBaseIndex }, { root: true })
  await context.dispatch('files/select', { item: index_item }, { root: true })

  await context.dispatch('load', { path: context.state.target.base })
}

const execute = (context: ActionContext<State, unknown>) => async (data: FeatureExecuteInput) => {
  const { source, target } = data
  const { success, result } = await api.template.invoke(source, target)

  if (success) {
    if (result) {
      await context.dispatch('files/load', { path: target }, { root: true })
      await context.dispatch('files/select', { path: result }, { root: true })
    }

    await context.dispatch('log', { level: 'info', message: `Template ${name} complete` }, { root: true })
  } else {
    await context.dispatch('log', { level: 'error', message: `Template ${name} failed: ${result}` }, { root: true })
  }
}

export default factory<void>('templates', create, execute)
