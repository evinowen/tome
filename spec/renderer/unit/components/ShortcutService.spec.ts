import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import ShortcutService from '@/components/ShortcutService.vue'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'
import { shortcuts } from '@/shortcuts'

vi.mock('@/modules/Shortcuts', () => ({ operate: vi.fn() }))
vi.mock('@/shortcuts', () => ({ shortcuts: vi.fn() }))

class MockedShorcutOperator {
  static escape = vi.fn()
  static layer = vi.fn()
  static perform = vi.fn()
  static dispatch = vi.fn()
}

vi.mocked(operate_shortcuts, true).mockImplementation(() => MockedShorcutOperator)

const shortcut_map = {
  layer: { layer: 'layer' },
  perform: { perform: 'performance' },
  dispatch: { dispatch: 'action' },
}

vi.mocked(shortcuts, true).mockImplementation((key) => (shortcut_map[key] ?? null))

describe('components/ShortcutService', () => {
  let vuetify
  let store

  const factory = assemble(ShortcutService)
    .context(() => ({
      global: {
        plugins: [ vuetify, [store, key] ],
      }
    }))

  beforeEach(() => {
    vuetify = createVuetify()
    store = createStore<State>({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should add event listener on component mount', async () => {
    const spy_addEventListener = vi.spyOn(window, 'addEventListener')
    expect(spy_addEventListener).not.toHaveBeenCalled()

    const wrapper = factory.wrap()

    expect(spy_addEventListener).toHaveBeenCalledWith('keyup', wrapper.vm.keyup)
  })

  it('should remove event listener on component unmount', async () => {
    const spy_removeEventListener = vi.spyOn(window, 'removeEventListener')
    expect(spy_removeEventListener).not.toHaveBeenCalled()

    const wrapper = factory.wrap()
    wrapper.unmount()

    expect(spy_removeEventListener).toHaveBeenCalledWith('keyup', wrapper.vm.keyup)
  })

  it('should call escape when keyup is called with Escape key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      key: 'Escape'
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).toHaveBeenCalled()
  })

  it('should call escape when keyup is called with Escape key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      key: 'Escape'
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).toHaveBeenCalled()
  })

  it('should not take action when keyup is called for unmapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'unmapped'
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()
  })

  it('should not take action when keyup is called for unmapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'unmapped'
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()
  })

  it('should call mapped layer when keyup is called for mapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'layer'
    } as KeyboardEvent

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.layer).toHaveBeenCalledWith(shortcut_map.layer.layer)
  })

  it('should not call mapped layer when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'layer'
    } as KeyboardEvent

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
  })

  it('should call perform when keyup is called for mapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'perform'
    } as KeyboardEvent

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.perform).toHaveBeenCalledWith(shortcut_map.perform.perform)
  })

  it('should not call mapped layer when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'perform'
    } as KeyboardEvent

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
  })

  it('should call dispatch when keyup is called for mapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'dispatch'
    } as KeyboardEvent

    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.dispatch).toHaveBeenCalledWith(shortcut_map.dispatch.dispatch)
  })

  it('should not call dispatch when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'dispatch'
    } as KeyboardEvent

    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()
  })
})
