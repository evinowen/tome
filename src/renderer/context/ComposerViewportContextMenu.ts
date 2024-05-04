import { Store } from '@/store'
import { ContextMenu, ContextItem, ContextCommand } from '@/store/modules/context'
import { format } from '@/modules/Titles'

export default function ComposerViewportContextMenu (store: Store, selection: string, replace: (string) => void) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles

  return ContextMenu.define(() => [
    [
      ContextItem.menu(
        'Action',
        async () => store.state.actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => {
              const output = await store.dispatch('actions/execute', { name, target: path, selection })

              replace(output || selection)
            },
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
        'Cut',
        async () => {
          await store.dispatch('clipboard/text', selection)
          replace('')
        },
        ContextCommand.control().key('X'),
      ).when(() => selection !== ''),
      ContextItem.action(
        'Copy',
        async () => {
          await store.dispatch('clipboard/text', selection)
        },
        ContextCommand.control().key('C'),
      ).when(() => selection !== ''),
      ContextItem.action(
        'Paste',
        async () => {
          await store.dispatch('clipboard/text', selection)
        },
        ContextCommand.control().key('V'),
      ).when(() => Boolean(store.state.clipboard.content)),
    ],
  ])
}
