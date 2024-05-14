import { Store, State } from '@/store'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextCommand from '@/objects/context/ContextCommand'
import File from '@/store/modules/files/file'
import { format } from '@/modules/Titles'

export default function ExplorerContextMenu (store: Store<State>, file: File) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles

  return ContextMenu.define(file.path, () => [
    [
      ContextItem.action(
        'New Template',
        async () => await store.dispatch('templates/ghost'),
      ),
      ContextItem.action(
        'New Action',
        async () => await store.dispatch('actions/ghost'),
      ),
    ],
    [
      ContextItem.menu(
        'Template',
        async () => store.state.templates.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => await store.dispatch('templates/execute', { name, target }),
          )
        }),
      ),
      ContextItem.menu(
        'Action',
        async () => store.state.actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (target) => await store.dispatch('actions/execute', { name, target }),
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Open',
        async (target) => await store.dispatch('files/open', { path: target, container: false }),
      ),
      ContextItem.action(
        'Open Folder',
        async (target) => await store.dispatch('files/open', { path: target, container: true }),
      ),
      ContextItem.action(
        'New File',
        async (target) => await store.dispatch('files/ghost', { path: target, directory: false }),
        ContextCommand.control().key('N'),
      ),
      ContextItem.action(
        'New Folder',
        async (target) => await store.dispatch('files/ghost', { path: target, directory: true }),
      ),
    ],
    [
      ContextItem.action(
        'Paste',
        async (target) => await store.dispatch('clipboard/paste', { type: 'file', target }),
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(store.state.clipboard.content)),
    ],
  ])
}
