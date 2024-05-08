import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createStore } from 'vuex'
import { State } from '@/store'
import { StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { stub_actions } from '?/builders/store'
import ContextMenu from '@/objects/context/ContextMenu'
import ContextItem from '@/objects/context/ContextItem'
import RenderedViewportContextMenu from '@/objects/context/menus/RenderedViewportContextMenu'
import { format } from '@/modules/Titles'

vi.mock('@/modules/Titles', () => ({
  format: vi.fn(),
}))

describe('objects/context/menus/RenderedViewportContextMenu', () => {
  let store
  let store_dispatch

  beforeEach(() => {
    store = createStore<State>({
      state: {
        clipboard: ClipboardStateDefaults(),
        configuration: ConfigurationStateDefaults(),
        actions: ActionsStateDefaults(),
      },
      actions: stub_actions([
        'actions/execute',
        'clipboard/text',
        'search/query',
        'system/search',
      ]),
    })

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
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    expect(menu).not.toBeUndefined()
    expect(menu instanceof ContextMenu).toBe(true)
  })

  /* Action */
  it('should contain Action option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)
  })

  it('should load Action items when Action option is loaded in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
  })

  it('should not format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is false', async () => {
    store.state.configuration.format_interaction_titles = false

    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(0)
  })

  it('should format Action item titles when Action option is loaded in generated ContextMenu and format_interaction_titles is true', async () => {
    store.state.configuration.format_interaction_titles = true

    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)
    expect(vi.mocked(format)).toHaveBeenCalledTimes(store.state.actions.options.length)
  })

  it('should dispatch actions/execute when an Action option is actioned in generated ContextMenu', async () => {
    store.state.configuration.format_interaction_titles = true

    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const action_option = menu.items.find((item) => item.title === 'Action')
    expect(action_option instanceof ContextItem).toBe(true)

    const items = await action_option.load()
    expect(items).toHaveLength(store.state.actions.options.length)

    await items[0].action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('actions/execute', {
      name: store.state.actions.options[0],
      target: menu.target,
      selection,
    })
  })

  /* Find */
  it('should contain Find option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
  })

  it('should disable Find option in generated ContextMenu when menu has no selection content', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
    expect(await find_option.active()).toBe(false)
  })

  it('should enable Find option in generated ContextMenu when menu has selection content', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(store, selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)
    expect(await find_option.active()).toBe(true)
  })

  it('should dispatch clipboard/text when Find option is actioned in generated ContextMenu', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(store, selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)

    await find_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('search/query', { path: menu.target, query: selection })
  })

  it('should dispatch system/search when Find option is actioned in generated ContextMenu', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(store, selection)

    const find_option = menu.items.find((item) => item.title === 'Find')
    expect(find_option instanceof ContextItem).toBe(true)

    await find_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('system/search', true)
  })

  /* Copy */
  it('should contain Copy option in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
  })

  it('should disable Copy option in generated ContextMenu when menu has no selection content', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(false)
  })

  it('should enable Copy option in generated ContextMenu when menu has selection content', async () => {
    const selection = 'Example Selction'

    const menu = RenderedViewportContextMenu(store, selection)

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)
    expect(await copy_option.active()).toBe(true)
  })

  it('should dispatch clipboard/text when Copy option is actioned in generated ContextMenu', async () => {
    const selection = ''

    const menu = RenderedViewportContextMenu(store, selection)

    store.state.clipboard.content = 'Clipboard Content'

    const copy_option = menu.items.find((item) => item.title === 'Copy')
    expect(copy_option instanceof ContextItem).toBe(true)

    await copy_option.action(menu.target)
    expect(store_dispatch).toHaveBeenCalledWith('clipboard/text', selection)
  })
})
