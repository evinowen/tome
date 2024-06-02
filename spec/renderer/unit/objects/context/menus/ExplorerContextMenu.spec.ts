import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import File from '@/objects/File'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'
import ExplorerContextMenu from '@/objects/context/menus/ExplorerContextMenu'
import { format } from '@/modules/Titles'
import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_templates_store } from '@/store/modules/templates'

vi.mock('@/modules/Titles', () => ({
  format: vi.fn(),
}))

describe('objects/context/menus/ExplorerContextMenu', () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'actions': {
          options: [
            'action.a',
            'action.b',
            'action.c',
          ],
        },
        'templates': {
          options: [
            'templates.a',
            'templates.b',
            'templates.c',
          ],
        },
      },
    })

    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBe(true)
  })

  /* New Template */
  it('should contain New Template option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch templates/ghost when New Template option is actioned in generated ContextMenu', async () => {
    const templates = fetch_templates_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_template_option = menu.items.find((item) => item.title === 'New Template')
    expect(new_template_option instanceof ContextItem).toBe(true)

    await new_template_option.action(menu.target)
    expect(templates.ghost).toHaveBeenCalledWith()
  })

  /* New Action */
  it('should contain New Action option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch actions/ghost when New Action option is actioned in generated ContextMenu', async () => {
    const actions = fetch_actions_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_action_option = menu.items.find((item) => item.title === 'New Action')
    expect(new_action_option instanceof ContextItem).toBe(true)

    await new_action_option.action(menu.target)
    expect(actions.ghost).toHaveBeenCalledWith()
  })

  /* Template */
  it('should contain Template option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)
  })

  it('should load Template items when Template option is loaded in generated ContextMenu', async () => {
    const templates = fetch_templates_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(templates.options.length)
  })

  it('should not format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    const templates = fetch_templates_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Template item titles when Template option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    const templates = fetch_templates_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(templates.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(templates.options.length)
  })

  it('should dispatch templates/execute when an Template option is actioned in generated ContextMenu', async () => {
    const templates = fetch_templates_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const template_option = menu.items.find((item) => item.title === 'Template')
    expect(template_option instanceof ContextItem).toBe(true)

    const items = await template_option.load()
    expect(items).toHaveLength(templates.options.length)

    await items[0].action(menu.target)
    expect(templates.execute).toHaveBeenCalledWith({
      name: templates.options[0],
      target: menu.target,
    })
  })

  /* Action */
  it('should contain Action option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)
  })

  it('should load Action items when Action option is loaded in generated ContextMenu', async () => {
    const actions = fetch_actions_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
  })

  it('should not format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = false

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(actions.options.length)
  })

  it('should dispatch actions/execute when an Action option is actions in generated ContextMenu', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    configuration.format_interaction_titles = true

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)

    await items[0].action(menu.target)
    expect(actions.execute).toHaveBeenCalledWith({
      name: actions.options[0],
      target: menu.target,
      selection: undefined,
    })
  })

  /* Open */
  it('should contain Open option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open option is actioned in generated ContextMenu', async () => {
    const files = fetch_files_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const open_option = menu.items.find((item) => item.title === 'Open')
    expect(open_option instanceof ContextItem).toBe(true)

    await open_option.action(menu.target)
    expect(files.open).toHaveBeenCalledWith({ path: menu.target, container: false })
  })

  /* Open Folder */
  it('should contain Open Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/open when Open Folder option is actioned in generated ContextMenu', async () => {
    const files = fetch_files_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const open_folder_option = menu.items.find((item) => item.title === 'Open Folder')
    expect(open_folder_option instanceof ContextItem).toBe(true)

    await open_folder_option.action(menu.target)
    expect(files.open).toHaveBeenCalledWith({ path: menu.target, container: true })
  })

  /* New File */
  it('should contain New File option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/haunt when New File option is actioned in generated ContextMenu', async () => {
    const files = fetch_files_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_file_option = menu.items.find((item) => item.title === 'New File')
    expect(new_file_option instanceof ContextItem).toBe(true)

    await new_file_option.action(menu.target)
    expect(files.haunt).toHaveBeenCalledWith({ path: menu.target, directory: false })
  })

  /* New Folder */
  it('should contain New Folder option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)
  })

  it('should dispatch files/haunt when New File option is actioned in generated ContextMenu', async () => {
    const files = fetch_files_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const new_folder_option = menu.items.find((item) => item.title === 'New Folder')
    expect(new_folder_option instanceof ContextItem).toBe(true)

    await new_folder_option.action(menu.target)
    expect(files.haunt).toHaveBeenCalledWith({ path: menu.target, directory: true })
  })

  /* Paste */
  it('should contain Paste option in generated ContextMenu', async () => {
    const file = new File({})

    const menu = ExplorerContextMenu(file)

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
  })

  it('should disable Paste option in generated ContextMenu when store has no clipboard content', async () => {
    const clipboard = fetch_clipboard_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    clipboard.content = { type: '', target: '' }

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(false)
  })

  it('should enable Paste option in generated ContextMenu when store has clipboard content', async () => {
    const clipboard = fetch_clipboard_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    clipboard.content = { type: 'type', target: 'target' }

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)
  })

  it('should dispatch clipboard/paste when Paste option is actioned in generated ContextMenu when store has clipboard content', async () => {
    const clipboard = fetch_clipboard_store()

    const file = new File({})

    const menu = ExplorerContextMenu(file)

    clipboard.content = { type: 'type', target: 'target' }

    const paste_option = menu.items.find((item) => item.title === 'Paste')
    expect(paste_option instanceof ContextItem).toBe(true)
    expect(await paste_option.active()).toBe(true)

    await paste_option.action(menu.target)
    expect(clipboard.paste).toHaveBeenCalledWith({ target: menu.target, type: 'file' })
  })
})
