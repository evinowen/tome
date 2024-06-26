import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ShortcutService from '@/components/ShortcutService.vue'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'
import { shortcuts } from '@/shortcuts'
import ContextCommand from '@/objects/context/ContextCommand'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenu from '@/objects/context/ContextMenu'

vi.mock('@/objects/context/ContextCommand', () => ({
  default: class {
    control = false
    alt = false
    shift = false
    key = ''
  },
}))

vi.mock('@/objects/context/ContextItem', () => ({
  default: class {
    action = vi.fn()
    execute = vi.fn()
    command: ContextCommand
  },
}))

vi.mock('@/objects/context/ContextMenu', () => ({
  default: vi.fn(),
}))

const mock_key = 'Test'

const mock_item_none = new ContextItem()
mock_item_none.command = new ContextCommand()
mock_item_none.command.key = mock_key

const mock_item_ctrl = new ContextItem()
mock_item_ctrl.command = new ContextCommand()
mock_item_ctrl.command.control = true
mock_item_ctrl.command.key = mock_key

const mock_item_shift = new ContextItem()
mock_item_shift.command = new ContextCommand()
mock_item_shift.command.shift = true
mock_item_shift.command.key = mock_key

const mock_item_alt = new ContextItem()
mock_item_alt.command = new ContextCommand()
mock_item_alt.command.alt = true
mock_item_alt.command.key = mock_key

vi.mocked(ContextMenu).mockImplementation(() => ({
  shortcuts: new Map<string, ContextItem[]>([
    [ mock_key.toLowerCase(), [ mock_item_none, mock_item_ctrl, mock_item_shift, mock_item_alt ] ],
  ]),
} as ContextMenu))

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

vi.mocked(shortcuts, true).mockImplementation((key) => (shortcut_map[key] ?? undefined))

describe('components/ShortcutService', () => {
  let vuetify
  let pinia

  const factory = assemble(ShortcutService)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'context': {
          menu: new ContextMenu(),
        },
      },
    })
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

  it('should call mapped context menu command when keyup is called with key event for mapped key with control', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      key: mock_key,
    } as KeyboardEvent

    await wrapper.vm.keyup(event)

    expect(mock_item_none.execute).not.toHaveBeenCalled()
    expect(mock_item_ctrl.execute).toHaveBeenCalled()
    expect(mock_item_shift.execute).not.toHaveBeenCalled()
    expect(mock_item_alt.execute).not.toHaveBeenCalled()
  })

  it('should call mapped context menu command when keyup is called with key event for mapped key with shift', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
      key: mock_key,
    } as KeyboardEvent

    await wrapper.vm.keyup(event)

    expect(mock_item_none.execute).not.toHaveBeenCalled()
    expect(mock_item_ctrl.execute).not.toHaveBeenCalled()
    expect(mock_item_shift.execute).toHaveBeenCalled()
    expect(mock_item_alt.execute).not.toHaveBeenCalled()
  })

  it('should call mapped context menu command when keyup is called with key event for mapped key with alt', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      key: mock_key,
    } as KeyboardEvent

    await wrapper.vm.keyup(event)

    expect(mock_item_none.execute).not.toHaveBeenCalled()
    expect(mock_item_ctrl.execute).not.toHaveBeenCalled()
    expect(mock_item_shift.execute).not.toHaveBeenCalled()
    expect(mock_item_alt.execute).toHaveBeenCalled()
  })

  it('should call escape when keyup is called with Escape key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      key: 'Escape',
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).toHaveBeenCalled()
  })

  it('should call escape when keyup is called with Escape key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      key: 'Escape',
    } as KeyboardEvent

    expect(MockedShorcutOperator.escape).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.escape).toHaveBeenCalled()
  })

  it('should not take action when keyup is called for unmapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'unmapped',
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
      key: 'unmapped',
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
      key: 'layer',
    } as KeyboardEvent

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.layer).toHaveBeenCalledWith(shortcut_map.layer.layer)
  })

  it('should not call mapped layer when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'layer',
    } as KeyboardEvent

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.layer).not.toHaveBeenCalled()
  })

  it('should call perform when keyup is called for mapped key event', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: true,
      key: 'perform',
    } as KeyboardEvent

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.perform).toHaveBeenCalledWith(shortcut_map.perform.perform)
  })

  it('should not call mapped layer when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'perform',
    } as KeyboardEvent

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.perform).not.toHaveBeenCalled()
  })

  it('should not call dispatch when keyup is called for mapped key event without ctrl key pressed', async () => {
    const wrapper = factory.wrap()

    const event = {
      ctrlKey: false,
      key: 'dispatch',
    } as KeyboardEvent

    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()

    await wrapper.vm.keyup(event)

    expect(MockedShorcutOperator.dispatch).not.toHaveBeenCalled()
  })
})
