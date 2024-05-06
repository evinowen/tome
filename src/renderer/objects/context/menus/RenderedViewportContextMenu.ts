import { Store, State } from '@/store'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextCommand from '@/objects/context/ContextCommand'
import { format } from '@/modules/Titles'

export default function RenderedViewportContextMenu (store: Store<State>, selection: string) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles
  return ContextMenu.define(undefined, () => [
    [
      ContextItem.menu(
        'Action',
        async () => store.state.actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => await store.dispatch('actions/execute', { name, target: path, selection }),
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Find',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        async () => {},
        ContextCommand.control().key('F'),
      ).when(async () => selection !== ''),
    ],
    [
      ContextItem.action(
        'Copy',
        async () => {
          await store.dispatch('clipboard/text', selection)
        },
        ContextCommand.control().key('C'),
      ).when(async () => selection !== ''),
    ],
  ])
}
