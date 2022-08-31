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

  it('should produce itself when instance is computed', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.instance).toBe(wrapper.vm)
  })

  it('should be flagged as system if the relationship equals root', async () => {
    const wrapper = factory.wrap({ relationship: 'root' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals git', async () => {
    const wrapper = factory.wrap({ relationship: 'git' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals tome', async () => {
    const wrapper = factory.wrap({ relationship: 'tome' })
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

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    await wrapper.vm.drop({
      target: {
        hasAttribute: jest.fn(() => true),
        classList: { remove: jest.fn() },
        closest: jest.fn(() => elm),
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

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        closest: jest.fn(() => elm),
        parentElement: {
          hasAttribute: jest.fn(() => true),
          classList: { add: jest.fn() }
        }
      }
    }

    await wrapper.vm.drag_start(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
  })

  it('should determine the correct parent container when a drag ends', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        closest: jest.fn(() => elm),
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

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
    expect(elm.classList.remove).toHaveBeenCalledTimes(0)

    await wrapper.vm.drag_leave(event)

    expect(elm.classList.remove).toHaveBeenCalledTimes(1)
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

  it('should find a placeholder display name if title is set and format fails', async () => {
    format.mockImplementationOnce(() => { throw new Error() })
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
})
