import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { State } from '@/store'
import { StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as TemplatesStateDefaults } from '@/store/modules/templates'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { stub_actions } from '?/builders/store'
import File, { FileRelationshipType } from '@/store/modules/files/file'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'
import ExplorerNodeContextMenu from '@/objects/context/menus/ExplorerNodeContextMenu'
import { format } from '@/modules/Titles'

vi.mock('@/modules/Titles', () => ({
  format: vi.fn(),
}))

describe('objects/context/menus/ExplorerNodeContextMenu', () => {
  let store
  let store_dispatch

  beforeEach(() => {
    store = createStore<State>({
      state: {
        clipboard: ClipboardStateDefaults(),
        configuration: ConfigurationStateDefaults(),
        templates: TemplatesStateDefaults(),
        actions: ActionsStateDefaults(),
      },
      actions: stub_actions([
        'clipboard/cut',
        'clipboard/copy',
        'clipboard/paste',
        'templates/execute',
        'templates/ghost',
        'actions/execute',
        'actions/ghost',
        'files/delete',
        'files/edit',
        'files/open',
        'files/ghost',
        'files/toggle',
      ]),
    })

    store.state.templates.options = [
      'template.a',
      'template.b',
      'template.c',
    ]

    store.state.actions.options = [
      'action.a',
      'action.b',
      'action.c',
    ]

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBe(true)
  })

  /* Expand */
  it('should not contain Expand option in generated ContextMenu when file is not a directory', async () => {
    const file = new File({})
    file.directory = false

    const menu = ExplorerNodeContextMenu(store, file)

    const expand_option = menu.items.find((item) => item.title === 'Expand')
    expect(expand_option).toBeUndefined()
  })

  it('should not contain Expand option in generated ContextMenu when file is directory but is expanded', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = true

    const menu = ExplorerNodeContextMenu(store, file)

    const expand_option = menu.items.find((item) => item.title === 'Expand')
    expect(expand_option).toBeUndefined()
  })

  it('should contain Expand option in generated ContextMenu when file is directory and is not expanded', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = false

    const menu = ExplorerNodeContextMenu(store, file)

    const expand_option = menu.items.find((item) => item.title === 'Expand')
    expect(expand_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/toggle when Expand option is actioned in generated ContextMenu', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = false

    const menu = ExplorerNodeContextMenu(store, file)

    const expand_option = menu.items.find((item) => item.title === 'Expand')
    expect(expand_option instanceof ContextItem).toBe(true)

    await expand_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/toggle', { path: file.path })
  })

  /* Collapse */
  it('should not contain Collapse option in generated ContextMenu when file is not a directory', async () => {
    const file = new File({})
    file.directory = false

    const menu = ExplorerNodeContextMenu(store, file)

    const collapse_option = menu.items.find((item) => item.title === 'Collapse')
    expect(collapse_option).toBeUndefined()
  })

  it('should not contain Collapse option in generated ContextMenu when file is directory but is not expanded', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = false

    const menu = ExplorerNodeContextMenu(store, file)

    const collapse_option = menu.items.find((item) => item.title === 'Collapse')
    expect(collapse_option).toBeUndefined()
  })

  it('should contain Collapse option in generated ContextMenu when file is directory and is expanded', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = true

    const menu = ExplorerNodeContextMenu(store, file)

    const collapse_option = menu.items.find((item) => item.title === 'Collapse')
    expect(collapse_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/toggle when Collapse option is actioned in generated ContextMenu', async () => {
    const file = new File({})
    file.directory = true
    file.expanded = true

    const menu = ExplorerNodeContextMenu(store, file)

    const collapse_option = menu.items.find((item) => item.title === 'Collapse')
    expect(collapse_option instanceof ContextItem).toBe(true)

    await collapse_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/toggle', { path: file.path })
  })

  /* New Template */
  it('should not contain New Template option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.None

    const menu = ExplorerNodeContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option).toBeUndefined()
  })

  it('should contain New Template option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)
  })

  it('should contain New Template option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)
  })

  it('should contain New Template option in generated ContextMenu when file has FileRelationshipType.TomeFeatureTemplates', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const menu = ExplorerNodeContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch templates/ghost when New Template option is actioned in generated ContextMenu', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)

    await new_template_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('templates/ghost')
  })

  /* New Action */
  it('should not contain New Action option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.None

    const menu = ExplorerNodeContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option).toBeUndefined()
  })

  it('should contain New Action option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)
  })

  it('should contain New Action option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)
  })

  it('should contain New Action option in generated ContextMenu when file has FileRelationshipType.TomeFeatureActions', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureActions

    const menu = ExplorerNodeContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch actions/ghost when New Action option is actioned in generated ContextMenu', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)

    await new_action_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('actions/ghost')
  })

  /* Template */
  it('should contain Template option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)
  })

  it('should load Template items when Template option is loaded in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
  })

  it('should not format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    store.state.configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(store.state.templates.options.length)
  })

  it('should dispatch templates/execute when an Template option is actioned in generated ContextMenu', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)

    await items[0].action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('templates/execute', {
      name: store.state.templates.options[0],
      target: menu.target,
    })
  })

  /* Action */
  it('should contain Action option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)
  })

  it('should load Action items when Action option is loaded in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
  })

  it('should not format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    store.state.configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(store.state.actions.options.length)
  })

  it('should dispatch actions/execute when an Action option is actions in generated ContextMenu', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)

    await items[0].action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('actions/execute', {
      name: store.state.actions.options[0],
      target: menu.target,
      selection: undefined,
    })
  })

  /* Open */
  it('should contain Open option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)

    await open_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: menu.target, container: false })
  })

  /* Open Folder */
  it('should contain Open Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open Folder option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)

    await open_folder_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: menu.target, container: true })
  })

  /* New File */
  it('should contain New File option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/ghost when New File option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)

    await new_file_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', { path: menu.target, directory: false })
  })

  /* New Folder */
  it('should contain New Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/ghost when New File option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)

    await new_folder_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', { path: menu.target, directory: true })
  })

  /* Cut */
  it('should contain Cut option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
  })

  it('should disable Cut option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(false)
  })

  it('should disable Cut option in generated ContextMenu when file has FileRelationshipType.Git', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Git

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(false)
  })

  it('should disable Cut option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(false)
  })

  it('should disable Cut option in generated ContextMenu when file has FileRelationshipType.TomeFeatureActions', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureActions

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(false)
  })

  it('should disable Cut option in generated ContextMenu when file has FileRelationshipType.TomeFeatureTemplates', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(false)
  })

  it('should enable Cut option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)
    expect(await cut_option.active()).toBe(true)
  })

  it('should dispatch clipboard/copy when Cut option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const cut_option = menu.items.find((item) => item.title === 'Cut')
    expect(cut_option instanceof ContextItem).toBe(true)

    await cut_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('clipboard/cut', { type: 'file', target: menu.target })
  })

  /* Copy */
  it('should contain Copy option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
  })

  it('should disable Copy option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should disable Copy option in generated ContextMenu when file has FileRelationshipType.Git', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Git

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should disable Copy option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should disable Copy option in generated ContextMenu when file has FileRelationshipType.TomeFeatureActions', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureActions

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should disable Copy option in generated ContextMenu when file has FileRelationshipType.TomeFeatureTemplates', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should enable Copy option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(true)
  })

  it('should dispatch clipboard/copy when Copy option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)

    await copy_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('clipboard/copy', { type: 'file', target: menu.target })
  })

  /* Paste */
  it('should contain Paste option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
  })

  it('should disable Paste option in generated ContextMenu when store has no clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    store.state.clipboard.content = ''

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(false)
  })

  it('should enable Paste option in generated ContextMenu when store has clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    store.state.clipboard.content = 'Clipboard Content'

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)
  })

  it('should dispatch clipboard/paste when Paste option is actioned in generated ContextMenu when store has clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    store.state.clipboard.content = 'Clipboard Content'

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)

    await paste_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('clipboard/paste', { target: menu.target, type: 'file' })
  })

  /* Rename */
  it('should contain Rename option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
  })

  it('should disable Rename option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(false)
  })

  it('should disable Rename option in generated ContextMenu when file has FileRelationshipType.Git', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Git

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(false)
  })

  it('should disable Rename option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(false)
  })

  it('should disable Rename option in generated ContextMenu when file has FileRelationshipType.TomeFeatureActions', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureActions

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(false)
  })

  it('should disable Rename option in generated ContextMenu when file has FileRelationshipType.TomeFeatureTemplates', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(false)
  })

  it('should enable Rename option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)
    expect(await rename_option.active()).toBe(true)
  })

  it('should dispatch files/ghost when Rename option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const rename_option = menu.items.find((item) => item.title === 'Rename')
    expect(rename_option instanceof ContextItem).toBe(true)

    await rename_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/edit', { path: menu.target })
  })

  /* Delete */
  it('should contain Delete option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
  })

  it('should disable Delete option in generated ContextMenu when file has FileRelationshipType.Root', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Root

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(false)
  })

  it('should disable Delete option in generated ContextMenu when file has FileRelationshipType.Git', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Git

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(false)
  })

  it('should disable Delete option in generated ContextMenu when file has FileRelationshipType.Tome', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.Tome

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(false)
  })

  it('should disable Delete option in generated ContextMenu when file has FileRelationshipType.TomeFeatureActions', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureActions

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(false)
  })

  it('should disable Delete option in generated ContextMenu when file has FileRelationshipType.TomeFeatureTemplates', async () => {
    const file = new File({})
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(false)
  })

  it('should enable Delete option in generated ContextMenu when file has FileRelationshipType.None', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)
    expect(await delete_option.active()).toBe(true)
  })

  it('should dispatch files/ghost when Delete option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerNodeContextMenu(store, file)

    const delete_option = menu.items.find((item) => item.title === 'Delete')
    expect(delete_option instanceof ContextItem).toBe(true)

    await delete_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/delete', { path: menu.target })
  })
})
