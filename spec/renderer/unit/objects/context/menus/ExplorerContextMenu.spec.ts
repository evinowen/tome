import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { State } from '@/store'
import { StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as TemplatesStateDefaults } from '@/store/modules/templates'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { stub_actions } from '?/builders/store'
import File from '@/store/modules/files/file'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'
import ExplorerContextMenu from '@/objects/context/menus/ExplorerContextMenu'
import { format } from '@/modules/Titles'

vi.mock('@/modules/Titles', () => ({
  format: vi.fn(),
}))

describe('objects/context/menus/ExplorerContextMenu', () => {
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
        'clipboard/paste',
        'templates/execute',
        'templates/ghost',
        'actions/execute',
        'actions/ghost',
        'files/open',
        'files/ghost',
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

    const menu = ExplorerContextMenu(store, file)

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBe(true)
  })

  /* New Template */
  it('should contain New Template option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch templates/ghost when New Template option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)

    await new_template_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('templates/ghost')
  })

  /* New Action */
  it('should contain New Action option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch actions/ghost when New Action option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)

    await new_action_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('actions/ghost')
  })

  /* Template */
  it('should contain Template option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)
  })

  it('should load Template items when Template option is loaded in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
  })

  it('should not format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    store.state.configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(store.state.templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(store.state.templates.options.length)
  })

  it('should dispatch templates/execute when an Template option is actioned in generated ContextMenu', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

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

    const menu = ExplorerContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)
  })

  it('should load Action items when Action option is loaded in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
  })

  it('should not format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    store.state.configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(store.state.actions.options.length)
  })

  it('should dispatch actions/execute when an Action option is actions in generated ContextMenu', async () => {
    store.state.configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

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

    const menu = ExplorerContextMenu(store, file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)

    await open_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: menu.target, container: false })
  })

  /* Open Folder */
  it('should contain Open Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open Folder option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)

    await open_folder_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: menu.target, container: true })
  })

  /* New File */
  it('should contain New File option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/ghost when New File option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)

    await new_file_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', { path: menu.target, directory: false })
  })

  /* New Folder */
  it('should contain New Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/ghost when New File option is actioned in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)

    await new_folder_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', { path: menu.target, directory: true })
  })

  /* Paste */
  it('should contain Paste option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
  })

  it('should disable Paste option in generated ContextMenu when store has no clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    store.state.clipboard.content = ''

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(false)
  })

  it('should enable Paste option in generated ContextMenu when store has clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    store.state.clipboard.content = 'Clipboard Content'

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)
  })

  it('should dispatch clipboard/paste when Paste option is actioned in generated ContextMenu when store has clipboard content', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(store, file)

    store.state.clipboard.content = 'Clipboard Content'

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)

    await paste_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('clipboard/paste', { target: menu.target, type: 'file' })
  })
})
