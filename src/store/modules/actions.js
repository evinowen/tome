import factory from '@/store/factories/feature'

export const ActionBaseIndex = 'resolve(\'done\')\n'

const create = (context) => async (path) => {
  const index_item = await context.dispatch('files/create', { path, name: 'index.js' }, { root: true })

  await context.dispatch('files/save', { item: index_item, content: ActionBaseIndex }, { root: true })

  await context.dispatch('files/select', { item: index_item }, { root: true })

  await context.dispatch('load', { path: index_item }, { root: true })

  await context.dispatch('load', { path: context.state.target.base })
}

const execute = (context) => async ({ name, source, target, selection }) => {
  const result = await window.api.action_invoke(source, target, selection)

  if (result.success) {
    const message = String(`Action ${name} complete`).concat(result.message ? `: ${result.message}` : '')
    await context.dispatch('message', message, { root: true })

    return result
  } else {
    const message = String(`Action ${name} failed`).concat(result.message ? `: ${result.message}` : '')
    await context.dispatch('error', message, { root: true })
  }
}

export default factory('actions', create, execute)
