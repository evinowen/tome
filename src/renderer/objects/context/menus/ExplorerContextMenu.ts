import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_templates_store } from '@/store/modules/templates'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextCommand from '@/objects/context/ContextCommand'
import File from '@/objects/File'
import { format } from '@/modules/Titles'

export default function ExplorerContextMenu (file: File) {
  const actions = fetch_actions_store()
  const clipboard = fetch_clipboard_store()
  const configuration = fetch_configuration_store()
  const files = fetch_files_store()
  const templates = fetch_templates_store()

  const format_interaction_titles = configuration.format_interaction_titles

  return ContextMenu.define(file.path, () => [
    [
      ContextItem.action(
        'New Template',
        async () => await templates.ghost(),
      ),
      ContextItem.action(
        'New Action',
        async () => await actions.ghost(),
      ),
    ],
    [
      ContextItem.menu(
        'Template',
        async () => templates.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => await templates.execute({ name, target }),
          )
        }),
      ),
      ContextItem.menu(
        'Action',
        async () => actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => await actions.execute({ name, target }),
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Open',
        async (target) => await files.open({ path: target, container: false }),
      ),
      ContextItem.action(
        'Open Folder',
        async (target) => await files.open({ path: target, container: true }),
      ),
      ContextItem.action(
        'New File',
        async (target) => await files.haunt({ path: target, directory: false }),
        ContextCommand.control().key('N'),
      ),
      ContextItem.action(
        'New Folder',
        async (target) => await files.haunt({ path: target, directory: true }),
      ),
    ],
    [
      ContextItem.action(
        'Paste',
        async (target) => await clipboard.paste({ type: 'file', target }),
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(clipboard.content.target)),
    ],
  ])
}
