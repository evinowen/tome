import { Store } from '@/store'
import { ContextMenu, ContextItem, ContextCommand } from '@/store/modules/context'
import { File } from '@/store/modules/files'
import { format } from '@/modules/Titles'

export default function ExplorerContextMenu (store: Store, file: File) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles
  const relationships = new Set([ 'root', 'git', 'tome', 'tome-templates', 'tome-actions' ])
  const system = relationships.has(file.relationship)

  return ContextMenu.define(() => [
    ContextMenu.if(system.value) || [
      special.push(ContextItem.action(
        'New Template',
        async () => await store.dispatch('templates/ghost'),
      )),
      special.push(ContextItem.action(
        'New Action',
        async () => await store.dispatch('actions/ghost'),
      )),
    ],
    ContextMenu.if(!system.value || properties.root) || [
      ContextItem.menu(
        'Template',
        async () => store.state.templates.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => await store.dispatch('templates/execute', { name, target: path }),
          )
        }),
      ),
      ContextItem.menu(
        'Action',
        async () => store.state.actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => await store.dispatch('actions/execute', { name, target: path, selection: undefined }),
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Open',
        async (path) => await store.dispatch('files/open', { path, container: false }),
      ),
      ContextItem.action(
        'Open Folder',
        async (path) => await store.dispatch('files/open', { path, container: true }),
      ),
      ContextItem.action(
        'New File',
        async (path) => await store.dispatch('files/ghost', { path, directory: false }),
        ContextCommand.control().key('N'),
      ),
      ContextItem.action(
        'New Folder',
        async (path) => await store.dispatch('files/ghost', { path, directory: true }),
      ),
    ],
    [
      ContextItem.action(
        'Paste',
        async (path) => await store.dispatch('clipboard/paste', { type: 'file', target: path }),
        ContextCommand.control().key('V'),
      ).when(() => Boolean(store.state.clipboard.content)),
    ],
  ])
}
