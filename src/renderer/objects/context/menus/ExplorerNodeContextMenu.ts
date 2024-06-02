import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_templates_store } from '@/store/modules/templates'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import ContextSection from '@/objects/context/ContextSection'
import ContextCommand from '@/objects/context/ContextCommand'
import File, { FileRelationshipType } from '@/objects/File'
import { format } from '@/modules/Titles'

export default function ExplorerNodeContextMenu (file: File) {
  const actions = fetch_actions_store()
  const clipboard = fetch_clipboard_store()
  const configuration = fetch_configuration_store()
  const files = fetch_files_store()
  const templates = fetch_templates_store()

  const format_interaction_titles = configuration.format_interaction_titles
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
          async () => await files.toggle({ path: file.path }),
        )
        : ContextItem.action(
          'Expand',
          async () => await files.toggle({ path: file.path }),
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
          async () => await templates.ghost(),
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
          async () => await actions.ghost(),
        ),
      )
      .items,
    ContextMenu.if(!system || file.relationship === FileRelationshipType.Root) || [
      ContextItem.menu(
        'Template',
        async () => templates.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => await templates.execute({ name, target: path }),
          )
        }),
      ),
      ContextItem.menu(
        'Action',
        async () => actions.options.map((name) => {
          return ContextItem.action(
            format_interaction_titles ? format(name, true) : name,
            async (path) => await actions.execute({ name, target: path }),
          )
        }),
      ),
    ],
    [
      ContextItem.action(
        'Open',
        async (path) => await files.open({ path, container: false }),
      ),
      ContextItem.action(
        'Open Folder',
        async (path) => await files.open({ path, container: true }),
        ContextCommand.shift().alt().key('R'),
      ),
      ContextItem.action(
        'New File',
        async (path) => await files.haunt({ path, directory: false }),
        ContextCommand.control().key('N'),
      ),
      ContextItem.action(
        'New Folder',
        async (path) => await files.haunt({ path, directory: true }),
      ),
    ],
    [
      ContextItem.action(
        'Cut',
        async (path) => await clipboard.cut({ type: 'file', target: path }),
        ContextCommand.control().key('X'),
      ).when(async () => !system),
      ContextItem.action(
        'Copy',
        async (path) => await clipboard.copy({ type: 'file', target: path }),
        ContextCommand.control().key('C'),
      ).when(async () => !system),
      ContextItem.action(
        'Paste',
        async (path) => await clipboard.paste({ type: 'file', target: path }),
        ContextCommand.control().key('V'),
      ).when(async () => Boolean(clipboard.content.target)),
    ],
    [
      ContextItem.action(
        'Rename',
        async (path) => await files.edit({ path }),
        ContextCommand.key('F2'),
      ).when(async () => !system),
      ContextItem.action(
        'Delete',
        async (path) => await files.delete({ path }),
        ContextCommand.key('Delete'),
      ).when(async () => !system),
    ],
  ])
}
