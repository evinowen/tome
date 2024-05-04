import { Store } from '@/store'
import { ContextMenu, ContextItem, ContextCommand } from '@/store/modules/context'
import { format } from '@/modules/Titles'

export default function RenderedViewportContextMenu (store: Store, selection: string) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles
  return ContextMenu.define(() => [
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
      ).when(() => selection !== ''),
    ],
    [
      ContextItem.action(
        'Copy',
        async () => {
          await store.dispatch('clipboard/text', selection)
        },
        ContextCommand.control().key('C'),
      ).when(() => selection !== ''),
    ],
  ])
}
