import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import RenderedViewportContextMenu from '@/objects/context/menus/RenderedViewportContextMenu'
import { format } from '@/modules/Titles'
import { fetch_actions_store } from '@/store/modules/actions'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_search_store } from '@/store/modules/search'
import { fetch_system_store } from '@/store/modules/system'

vi.mock('@/modules/Titles', () => ({
  format: vi.fn(),
}))

describe('objects/context/menus/RenderedViewportContextMenu', () => {
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
      },
    })

    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBe(true)
  })

  /* Action */
  it('should contain Action option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)
  })

  it('should load Action items when Action option is loaded in generated ContextMenu', async () => {
    const actions = fetch_actions_store()

    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
  })

  it('should not format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_interaction_titles: false }

    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_interaction_titles: true }

    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(actions.options.length)
  })

  it('should dispatch actions/execute when an Action option is actioned in generated ContextMenu', async () => {
    const actions = fetch_actions_store()

    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_interaction_titles: true }

    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(actions.options.length)

    await items[0].action(menu.target)
    expect(actions.execute).toHaveBeenCalledWith({
      name: actions.options[0],
      target: menu.target,
      input: selection,
    })
  })

  /* Find */
  it('should contain Find option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
  })

  it('should disable Find option in generated ContextMenu when menu has no selection content', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
    expect(await find_option.active()).toBe(false)
  })

  it('should enable Find option in generated ContextMenu when menu has selection content', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
    expect(await find_option.active()).toBe(true)
  })

  it('should dispatch clipboard/text when Find option is actioned in generated ContextMenu', async () => {
    const search = fetch_search_store()

    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)

    await find_option.action(menu.target)
    expect(search.execute).toHaveBeenCalledWith({ path: menu.target, query: selection })
  })

  it('should dispatch system/search when Find option is actioned in generated ContextMenu', async () => {
    const system = fetch_system_store()

    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)

    await find_option.action(menu.target)
    expect(system.page).toHaveBeenCalledWith({ search: true })
  })

  /* Copy */
  it('should contain Copy option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
  })

  it('should disable Copy option in generated ContextMenu when menu has no selection content', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should enable Copy option in generated ContextMenu when menu has selection content', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(true)
  })

  it('should dispatch clipboard/text when Copy option is actioned in generated ContextMenu', async () => {
    const clipboard = fetch_clipboard_store()

    const selection = ''

    const menu = RenderedViewportContextMenu(selection)

    clipboard.content = { type: 'type', target: 'target' }

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)

    await copy_option.action(menu.target)
    expect(clipboard.text).toHaveBeenCalledWith(selection)
  })
})
