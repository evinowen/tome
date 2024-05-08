import { Store, State } from '@/store'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextSection from '@/objects/context/ContextSection'
import ContextCommand from '@/objects/context/ContextCommand'
import File, { FileRelationshipType } from '@/store/modules/files/file'
import { format } from '@/modules/Titles'

export default function ExplorerNodeContextMenu (store: Store<State>, file: File) {
  const format_interaction_titles = store.state.configuration.format_interaction_titles
  const system = new Set([
    FileRelationshipType.Root,
    FileRelationshipType.Git,
    FileRelationshipType.Tome,
    FileRelationshipType.TomeFeatureActions,
    FileRelationshipType.TomeFeatureTemplates,
  ]).has(file.relationship)

  return ContextMenu.define(file.path, () => [
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
    ContextMenu.if(system) || new ContextSection()
      .add(
        [
          FileRelationshipType.Root,
          FileRelationshipType.Tome,
          FileRelationshipType.TomeFeatureTemplates,
        ].includes(file.relationship),
        ContextItem.action(
          'New Template',
          async () => await store.dispatch('templates/ghost'),
        ),
      )
      .add(
        [
          FileRelationshipType.Root,
          FileRelationshipType.Tome,
          FileRelationshipType.TomeFeatureActions,
        ].includes(file.relationship),
        ContextItem.action(
          'New Action',
          async () => await store.dispatch('actions/ghost'),
        ),
      )
      .items,
    ContextMenu.if(!system || file.relationship === FileRelationshipType.Root) || [
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
      ).when(async () => !system),
      ContextItem.action(
        'Copy',
        async (path) => await store.dispatch('clipboard/copy', { type: 'file', target: path }),
        ContextCommand.control().key('C'),
      ).when(async () => !system),
      ContextItem.action(
        'Paste',
        async (path) => await store.dispatch('clipboard/paste', { type: 'file', target: path }),
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(store.state.clipboard.content)),
    ],
    [
      ContextItem.action(
        'Rename',
        async (path) => await store.dispatch('files/edit', { path }),
        ContextCommand.key('F2'),
      ).when(async () => !system),
      ContextItem.action(
        'Delete',
        async (path) => await store.dispatch('files/delete', { path }),
        ContextCommand.key('Delete'),
      ).when(async () => !system),
    ],
  ])
}
