import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_search_store } from '@/store/modules/search'
import { fetch_system_store } from '@/store/modules/system'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextCommand from '@/objects/context/ContextCommand'
import { format } from '@/modules/Titles'

export default function ComposerViewportContextMenu (selection: string, replace: (string) => void) {
  const actions = fetch_actions_store()
  const clipboard = fetch_clipboard_store()
  const configuration = fetch_configuration_store()
  const search = fetch_search_store()
  const system = fetch_system_store()

  const format_interaction_titles = configuration.active.format_interaction_titles

  return ContextMenu.define(undefined, () => [
    [
      ContextItem.menu(
        'Action',
        async () => actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => {
              const { output = '' } = await actions.execute({ name, target, input: selection }) ?? {}

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
          await search.execute({ path, query: selection })
          await system.page({ search: true })
        },
        ContextCommand.control().key('F'),
      ).when(async () => selection !== ''),
    ],
    [
      ContextItem.action(
        'Cut',
        async () => {
          await clipboard.text(selection)
          replace('')
        },
        ContextCommand.control().key('X'),
      ).when(async () => selection !== ''),
      ContextItem.action(
        'Copy',
        async () => {
          await clipboard.text(selection)
        },
        ContextCommand.control().key('C'),
      ).when(async () => selection !== ''),
      ContextItem.action(
        'Paste',
        async (target) => {
          await clipboard.paste({ target })
        },
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(clipboard.content.target)),
    ],
  ])
}
