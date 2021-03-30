import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import store from '@/store'

import ExplorerNode from '@/components/ExplorerNode.vue'

jest.mock('@/store', () => ({
  state: {
    clipboard: {
      content: { type: 'file', target: '/path' }
    },
    tome: {
      path: '/project'
    },
    templates: {
      options: ['one', 'two', 'three']
    },
    actions: {
      options: ['one', 'two', 'three']
    }
  },
  dispatch: jest.fn()
}))

Vue.use(Vuetify)

describe('ExplorerNode.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const format = jest.fn((name) => name)
  const factory = assemble(ExplorerNode, {
    name: 'Name',
    path: '/pa/th/to/fi/le',
    active: 'Active',
    populate: null,
    new_file: null,
    new_folder: null,
    open_folder: null,
    highlight: 'Highlight',
    directory: false,
    format: format
  })
    .context(() => ({ vuetify }))

  it('should be flagged as system if the filename equals .git', async () => {
    const wrapper = factory.wrap({ name: '.git' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should emit a drag event when a drag starts with this component', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('drag', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_start({
      dataTransfer: {},
      target: {
        style: {}
      }
    })

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit a drop event when a drop starts with this component', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('drop', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.drop({
      target: {
        hasAttribute: jest.fn(() => true),
        classList: { remove: jest.fn() },
        parentElement: null
      }
    })

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should reset opacity when dragging ends', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = {
      dataTransfer: {},
      target: {
        style: { opacity: 1 }
      }
    }

    const opacity = event.target.style.opacity

    await wrapper.vm.drag_start(event)

    expect(event.target.style.opacity).not.toBe(opacity)

    await wrapper.vm.drag_end(event)

    expect(event.target.style.opacity).toBe(opacity)
  })

  it('should determine the correct parent container when a drag begins', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        parentElement: {
          hasAttribute: jest.fn(() => true),
          classList: { add: jest.fn() }
        }
      }
    }

    await wrapper.vm.drag_start(event)

    expect(event.target.hasAttribute).toHaveBeenCalledTimes(0)
    expect(event.target.parentElement.hasAttribute).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(event.target.hasAttribute).toHaveBeenCalledTimes(1)
    expect(event.target.parentElement.hasAttribute).toHaveBeenCalledTimes(1)
  })

  it('should determine the correct parent container when a drag ends', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        parentElement: {
          hasAttribute: jest.fn(() => true),
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
        }
      }
    }

    await wrapper.vm.drag_start(event)

    expect(event.target.hasAttribute).toHaveBeenCalledTimes(0)
    expect(event.target.parentElement.hasAttribute).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(event.target.hasAttribute).toHaveBeenCalledTimes(1)
    expect(event.target.parentElement.hasAttribute).toHaveBeenCalledTimes(1)

    await wrapper.vm.drag_leave(event)

    expect(event.target.hasAttribute).toHaveBeenCalledTimes(2)
    expect(event.target.parentElement.hasAttribute).toHaveBeenCalledTimes(2)
  })

  it('should refresh input field value when focus is called', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ input: 'test' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input).not.toBe(wrapper.vm.display)

    await wrapper.vm.focus()

    expect(wrapper.vm.input).toBe(wrapper.vm.display)
  })

  it('should format the display name if title is set and instance is non-system', async () => {
    const format = jest.fn()
    const wrapper = factory.wrap({ title: true, format })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(format).toHaveBeenCalledTimes(2)
  })

  it('should emit open event when Open context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('open', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Open') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit open event when Open Folder context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('open', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Open Folder') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit open event when New File context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('create', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action

    wrapper.vm.context.forEach(item => {
      if (item.title === 'New File') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit create event when New Folder context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('create', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'New Folder') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should dispatch the cut store action when Cut context menu action is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Cut') {
        action = item.action
      }
    })

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await action()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('cut')
  })

  it('should emit open event when Copy context menu action is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Copy') {
        action = item.action
      }
    })

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await action()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('copy')
  })

  it('should dispatch paste action when Paste context menu action is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Paste') {
        action = item.action
      }
    })

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await action()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('paste')
  })

  it('should return true for paste active state when store has paste value', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let active
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Paste') {
        active = item.active
      }
    })

    expect(active()).toBeTruthy()
  })

  it('should emit edit event when Rename context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('edit', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Rename') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit delete event when Delete context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('delete', event)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Delete') {
        action = item.action
      }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should use root icon when the directory and root flags are true', async () => {
    const wrapper = factory.wrap({ directory: true, root: true })

    expect(wrapper.vm.icon).toBe('mdi-book')
  })

  it('should use expanded root icon when the directory and root flags are true while expanded', async () => {
    const wrapper = factory.wrap({ directory: true, root: true, expanded: true })

    expect(wrapper.vm.icon).toBe('mdi-book-open-page-variant')
  })

  it('should use directory icon when the directory flag but not root flag is true', async () => {
    const wrapper = factory.wrap({ directory: true, root: false })

    expect(wrapper.vm.icon).toBe('mdi-folder')
  })

  it('should use directory icon when the directory flag but not root flag is true, but title format check fails', async () => {
    format.mockImplementationOnce((name, _, error) => {
      error()
      return name
    })

    const wrapper = factory.wrap({ directory: true, root: false })

    expect(wrapper.vm.icon).toBe('mdi-folder-outline')
  })

  it('should use expanded directory icon when the directory flag but not root flag is true while expanded', async () => {
    const wrapper = factory.wrap({ directory: true, root: false, expanded: true })

    expect(wrapper.vm.icon).toBe('mdi-folder-open')
  })

  it('should use expanded directory icon when the directory flag but not root flag is true while expanded, but title format check fails', async () => {
    format.mockImplementationOnce((name, _, error) => {
      error()
      return name
    })

    const wrapper = factory.wrap({ directory: true, root: false, expanded: true })

    expect(wrapper.vm.icon).toBe('mdi-folder-open-outline')
  })

  it('should use file icon when both the directory and root flags are not true', async () => {
    const wrapper = factory.wrap({ directory: false, root: false })

    expect(wrapper.vm.icon).toBe('mdi-file')
  })

  it('should use file outline icon when both the directory and root flags are not true, but title format check fails', async () => {
    format.mockImplementationOnce((name, _, error) => {
      error()
      return name
    })

    const wrapper = factory.wrap({ directory: false, root: false })

    expect(wrapper.vm.icon).toBe('mdi-file-outline')
  })

  it('should translate template options into context menu items when templates are loaded', async () => {
    const wrapper = factory.wrap({ directory: false, root: false })

    const items = await wrapper.vm.load_templates()
    expect(items).not.toBeNull()
    expect(items.length).toBe(3)

    const event = jest.fn()
    wrapper.vm.$on('template', event)

    expect(event).toHaveBeenCalledTimes(0)

    await items[0].action('/project/first')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should translate action options into context menu items when actions are loaded', async () => {
    const wrapper = factory.wrap({ directory: false, root: false })

    const items = await wrapper.vm.load_actions()
    expect(items).not.toBeNull()
    expect(items.length).toBe(3)

    const event = jest.fn()
    wrapper.vm.$on('action', event)

    expect(event).toHaveBeenCalledTimes(0)

    await items[0].action('/project/first')

    expect(event).toHaveBeenCalledTimes(1)

    await items[0].action('/project/first')
  })
})
