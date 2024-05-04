import { Store } from '@/store'
import { ContextMenu, ContextItem, ContextSection, ContextCommand } from '@/store/modules/context'
import { File } from '@/store/modules/files'
import { format } from '@/modules/Titles'

export default function ExplorerNodeContextMenu (store: Store, file: File) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles
  const relationships = new Set([ 'root', 'git', 'tome', 'tome-templates', 'tome-actions' ])
  const system = relationships.has(file.relationship)

  return ContextMenu.define(() => [
    ContextMenu.if(file.directory) || [
      file.expanded
        ? ContextItem.action(
          'Collapse',
          async () => await store.dispatch('files/toggle', { path: file.path }),
        )
        : ContextItem.action(
          'Expand',
          async () => await store.dispatch('files/toggle', { path: file.path }),
        ),
    ],
    ContextMenu.if(system.value) || new ContextSection()
      .add(
        [ 'root', 'tome', 'tome-feature-templates' ].includes(file.relationship),
        special.push(ContextItem.action(
          'New Template',
          async () => await store.dispatch('templates/ghost'),
        )),
      )
      .add(
        [ 'root', 'tome', 'tome-feature-actions' ].includes(file.relationship),
        special.push(ContextItem.action(
          'New Action',
          async () => await store.dispatch('actions/ghost'),
        )),
      )
      .items,
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
        ContextCommand.shift().alt().key('R'),
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
        'Cut',
        async (path) => await store.dispatch('clipboard/cut', { type: 'file', target: path }),
        ContextCommand.control().key('X'),
      ).when(() => !system),
      ContextItem.action(
        'Copy',
        async (path) => await store.dispatch('clipboard/copy', { type: 'file', target: path }),
        ContextCommand.control().key('C'),
      ),
      ContextItem.action(
        'Paste',
        async (path) => await store.dispatch('clipboard/paste', { type: 'file', target: path }),
        ContextCommand.control().key('V'),
      ).when(() => Boolean(store.state.clipboard.content)),
    ],
    [
      ContextItem.action(
        'Rename',
        async (path) => await store.dispatch('files/edit', { path }),
        ContextCommand.key('F2'),
      ).when(() => !system),
      ContextItem.action(
        'Delete',
        async (path) => await store.dispatch('files/delete', { path }),
        ContextCommand.key('Delete'),
      ).when(() => !system),
    ],
  ])
}
