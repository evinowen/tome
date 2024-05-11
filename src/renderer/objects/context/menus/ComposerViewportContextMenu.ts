import { Store, State } from '@/store'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextCommand from '@/objects/context/ContextCommand'
import { format } from '@/modules/Titles'

export default function ComposerViewportContextMenu (store: Store<State>, selection: string, replace: (string) => void) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles

  return ContextMenu.define(undefined, () => [
    [
      ContextItem.menu(
        'Action',
        async () => store.state.actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => {
              const { output } = await store.dispatch('actions/execute', { name, target, input: selection })

              replace(output || selection)
            },
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Find',
        async (path) => {
          await store.dispatch('search/query', { path, query: selection })
          await store.dispatch('system/search', true)
        },
        ContextCommand.control().key('F'),
      ).when(async () => selection !== ''),
    ],
    [
      ContextItem.action(
        'Cut',
        async () => {
          await store.dispatch('clipboard/text', selection)
          replace('')
        },
        ContextCommand.control().key('X'),
      ).when(async () => selection !== ''),
      ContextItem.action(
        'Copy',
        async () => {
          await store.dispatch('clipboard/text', selection)
        },
        ContextCommand.control().key('C'),
      ).when(async () => selection !== ''),
      ContextItem.action(
        'Paste',
        async (target) => {
          await store.dispatch('clipboard/paste', { target })
        },
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(store.state.clipboard.content)),
    ],
  ])
}
