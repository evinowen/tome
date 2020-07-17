import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ExplorerDirectory from '@/components/ExplorerDirectory.vue'

Vue.use(Vuetify)

describe('ExplorerDirectory.vue', () => {
  let parent = {
    children: []
  }

  let vuetify

  beforeEach(() => {
    parent.children.length = 0

    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(ExplorerDirectory, {
    name: 'Name',
    path: '/pa/th/to/fi/le',
    active: 'Active',
    populate: (object) => {
      const children = [
        {
          directory: true,
          path: '/path456',
          uuid: 'uuid-2'
        },
        {
          directory: true,
          path: '/path123',
          uuid: 'uuid-1'
        },
        {
          directory: false,
          path: '/pathABC',
          uuid: 'uuid-4'
        },
        {
          directory: true,
          path: '/path789',
          uuid: 'uuid-3'
        }
      ]

      object.children.push(...children)

      return true
    },
    new_file: null,
    new_folder: null,
    open_folder: null,
    leaf: false,
    children: parent.children
  })
    .context(() => ({ vuetify, stubs: { ExplorerFile: true } }))

  it('should emit input event immediately when instance is ephemeral', async () => {
    const wrapper = factory.wrap({ ephemeral: true })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.emitted().input).toBeTruthy()
  })

  it('should compute expanded root icon when instance is not a leaf or closed', async () => {
    const wrapper = factory.wrap({ leaf: false, expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.expanded).toBe(true)
    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should compute closed folder icon when instance is a leaf but not expanded', async () => {
    const wrapper = factory.wrap({ leaf: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })

  it('should emit submit event when submit is called and value is valid', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ valid: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('submit', event)

    expect(event).toHaveBeenCalledTimes(0)

    wrapper.vm.valid = true

    await wrapper.vm.submit()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should not emit submit event when submit is called and value is not valid', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ valid: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('submit', event)

    expect(event).toHaveBeenCalledTimes(0)

    wrapper.vm.valid = false

    await wrapper.vm.submit()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should refresh input field value when focus is called', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ input: 'test' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input).not.toBe(wrapper.vm.display)

    await wrapper.vm.focus()

    expect(wrapper.vm.input).toBe(wrapper.vm.display)
  })

  it('should emit a drag event when a drag starts with this component', async () => {
    const wrapper = factory.wrap({ leaf: false })
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
    const wrapper = factory.wrap({ leaf: false })
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
    const wrapper = factory.wrap({ leaf: true })
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

  it('should determine the correct parent container when a dragging over', async () => {
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
})
