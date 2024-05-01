import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { StateDefaults as ClipboardStateDefaults } from '@/store/modules/clipboard'
import { StateDefaults as FilesStateDefaults, File } from '@/store/modules/files'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as TemplatesStateDefaults } from '@/store/modules/templates'
import ExplorerNode from '@/components/ExplorerNode.vue'
import { FileRelationshipType } from '@/store/modules/files/file'

describe('components/ExplorerNode', () => {
  let vuetify
  let store
  let store_dispatch

  const file_uuid = '1234-test-1234-test'
  let file

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        files: {
          ...FilesStateDefaults(),
          directory: {
            [file_uuid]: new File({
              name: 'Name',
              path: '/pa/th/to/fi/le.txt',
              extension: 'txt',
              children: [],
              directory: false,
            }),
          },
        },
        clipboard: {
          ...ClipboardStateDefaults(),
          content: { type: 'file', target: '/path' },
        },
        configuration: {
          ...ConfigurationStateDefaults(),
          draggable_objects: true,
        },
        repository: {
          ...RepositoryStateDefaults(),
          path: '/project',
        },
        templates: {
          ...TemplatesStateDefaults(),
          options: [ 'one', 'two', 'three' ],
        },
        actions: {
          ...ActionsStateDefaults(),
          options: [ 'one', 'two', 'three' ],
        },
      },
      actions: stub_actions([
        'clipboard/copy',
        'clipboard/cut',
        'clipboard/paste',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    file = store.state.files.directory[file_uuid]
    file.relationship = FileRelationshipType.None
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const format = vi.fn((name) => name)

  const factory = assemble(ExplorerNode, {
    uuid: file_uuid,
    active: 'Active',
    format,
  })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
      },
    }))

  it('should be flagged as system if the relationship equals root', async () => {
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals tome', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should emit a drag event when a drag starts with this component', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('drag')).not.toBeDefined()

    await wrapper.vm.drag_start({
      dataTransfer: {},
      target: {
        style: {},
      },
    })

    expect(wrapper.emitted('drag')).toHaveLength(1)
  })

  it('should emit a drop event when a drop starts with this component', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('drop')).not.toBeDefined()

    const elm = {
      classList: { add: vi.fn(), remove: vi.fn() },
    }

    await wrapper.vm.drop({
      target: {
        hasAttribute: vi.fn(() => true),
        classList: { remove: vi.fn() },
        closest: vi.fn(() => elm),
        parentElement: undefined,
      },
    })

    expect(wrapper.emitted('drop')).toHaveLength(1)
  })

  it('should reset opacity when dragging ends', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    const event = {
      dataTransfer: {},
      target: {
        style: { opacity: 1 },
      },
    }

    const opacity = event.target.style.opacity

    await wrapper.vm.drag_start(event)

    expect(event.target.style.opacity).not.toBe(opacity)

    await wrapper.vm.drag_end(event)

    expect(event.target.style.opacity).toBe(opacity)
  })

  it('should determine the correct parent container when a drag begins', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    const elm = {
      classList: { add: vi.fn(), remove: vi.fn() },
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: vi.fn(() => false),
        style: { opacity: 1 },
        closest: vi.fn(() => elm),
        parentElement: {
          hasAttribute: vi.fn(() => true),
          classList: { add: vi.fn() },
        },
      },
    }

    await wrapper.vm.drag_start(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
  })

  it('should determine the correct parent container when a drag ends', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    const elm = {
      classList: { add: vi.fn(), remove: vi.fn() },
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: vi.fn(() => false),
        style: { opacity: 1 },
        closest: vi.fn(() => elm),
        parentElement: {
          hasAttribute: vi.fn(() => true),
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
          },
        },
      },
    }

    await wrapper.vm.drag_start(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
    expect(elm.classList.remove).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_leave(event)

    expect(elm.classList.remove).toHaveBeenCalledTimes(1)
  })

  it('should refresh input field value when focus is called', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.input = 'test'

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.input).not.toBe(wrapper.vm.display)

    await wrapper.vm.focus()

    expect(wrapper.vm.input).toBe(wrapper.vm.display)
  })

  it('should format the display name if title is set and instance is non-system', async () => {
    const format = vi.fn()
    const wrapper = factory.wrap({ title: true, format })
    await wrapper.vm.$nextTick()

    expect(format).toHaveBeenCalledTimes(2)
  })

  it('should find a placeholder display name if title is set and format fails', async () => {
    format.mockImplementationOnce(() => {
      throw new Error('Mock Error')
    })
    const wrapper = factory.wrap({ title: true, format })
    await wrapper.vm.$nextTick()

    expect(format).toHaveBeenCalledTimes(2)
  })

  it('should emit open event when Open context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action
    for (const item of wrapper.vm.context) {
      if (item.title === 'Open') {
        action = item.action
      }
    }

    expect(wrapper.emitted('open')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('should emit open event when Open Folder context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action
    for (const item of wrapper.vm.context) {
      if (item.title === 'Open Folder') {
        action = item.action
      }
    }

    expect(wrapper.emitted('open')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('should emit open event when New File context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action

    for (const item of wrapper.vm.context) {
      if (item.title === 'New File') {
        action = item.action
      }
    }

    expect(wrapper.emitted('create')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('create')).toHaveLength(1)
  })

  it('should emit create event when New Folder context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action
    for (const item of wrapper.vm.context) {
      if (item.title === 'New Folder') {
        action = item.action
      }
    }

    expect(wrapper.emitted('create')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('create')).toHaveLength(1)
  })

  it('should dispatch the cut store action when Cut context menu action is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const target = './index.md'

    await wrapper.vm.context.find((item) => item.title === 'Cut').action(target)

    expect(store_dispatch).toHaveBeenCalledWith('clipboard/cut', { target, type: 'file' })
  })

  it('should emit open event when Copy context menu action is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const target = './index.md'

    await wrapper.vm.context.find((item) => item.title === 'Copy').action(target)

    expect(store_dispatch).toHaveBeenCalledWith('clipboard/copy', { target, type: 'file' })
  })

  it('should dispatch paste action when Paste context menu action is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const target = './index.md'

    await wrapper.vm.context.find((item) => item.title === 'Paste').action(target)

    expect(store_dispatch).toHaveBeenCalledWith('clipboard/paste', { target, type: 'file' })
  })

  it('should return true for paste active state when store has paste value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    let active
    for (const item of wrapper.vm.context) {
      if (item.title === 'Paste') {
        active = item.active
      }
    }

    expect(active()).toBeTruthy()
  })

  it('should emit edit event when Rename context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action
    for (const item of wrapper.vm.context) {
      if (item.title === 'Rename') {
        action = item.action
      }
    }

    expect(wrapper.emitted('edit')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('should emit delete event when Delete context menu action is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    let action
    for (const item of wrapper.vm.context) {
      if (item.title === 'Delete') {
        action = item.action
      }
    }

    expect(wrapper.emitted('delete')).not.toBeDefined()

    await action()

    expect(wrapper.emitted('delete')).toHaveLength(1)
  })
})
