import Vue from 'vue'
import Vuetify from 'vuetify'

import ExplorerDirectory from '@/components/ExplorerDirectory.vue'
import ExplorerFile from '@/components/ExplorerFile.vue'

Vue.use(Vuetify)

describe('ExplorerDirectory.vue', () => {
  let children
  let vuetify

  beforeEach(() => {
    children = [
      {
        directory: true,
        path: '/path123',
        uuid: 'uuid-1'
      },
      {
        directory: true,
        path: '/path456',
        uuid: 'uuid-2'
      },
      {
        directory: false,
        path: '/path789',
        uuid: 'uuid-3'
      }
    ]

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
      object.children = children

      return true
    },
    new_file: null,
    new_folder: null,
    open_folder: null,
    leaf: false
  })
  .context(() => ({ vuetify, stubs: { ExplorerFile: true } } ))

  it('should expand immediately when instance is not a leaf', async () => {
    const wrapper = factory.wrap({ leaf: false })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.expanded).toBe(true)
  })

  it('should collapse when toggle is called on instance', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.expanded).toBe(true)

    await expect(wrapper.vm.toggle()).resolves.toBeDefined()

    expect(wrapper.vm.expanded).toBe(false)
  })

  it('should compute expanded root icon when instance is not a leaf or closed', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    if (!wrapper.vm.expanded) {
      await expect(wrapper.vm.toggle()).resolves.toBeDefined()
    }

    expect(wrapper.vm.expanded).toBe(true)
    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should compute closed folder icon when instance is a leaf but not expanded', async () => {
    const wrapper = factory.wrap({ leaf: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })

  it('should remove node if provided path matches when remove_item is called', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    wrapper.vm.remove_item(children[0])

    expect(wrapper.vm.children.length).toBe(length - 1)
  })

  it('should remove nothing if provided path does not match when remove_item is called', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    wrapper.vm.remove_item({ path: '/not.there',  uuid: 'uuid-x' })

    expect(wrapper.vm.children.length).toBe(length)
  })

  it('should insert node when insert is called', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    wrapper.vm.insert_item({
      directory: false,
      path: '/pathABC',
      uuid: 'uuid-4'
    })

    expect(wrapper.vm.children.length).toBe(length + 1)
  })

  it('should create file node when create is called with falsy directory flag', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    await wrapper.vm.create(false)

    expect(wrapper.vm.children.length).toBe(length + 1)
  })

  it('should expand node when create is called with while not expanded', async () => {
    const wrapper = factory.wrap({ leaf: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.expanded).toBe(false)

    await wrapper.vm.create(false)

    expect(wrapper.vm.expanded).toBe(true)
  })

  it('should create directory node when create is called with truthy directory flag', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    await wrapper.vm.create(true)

    expect(wrapper.vm.children.length).toBe(length + 1)
  })

  it('should create directory node at path when create is called with truthy directory flag and a path', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const length = wrapper.vm.children.length

    await wrapper.vm.create(true, '/path456')

    expect(wrapper.vm.children.length).toBe(length + 1)
  })

  it('should emit submit event when submit is called', async () => {
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

  it('should refresh input field value when focus is called', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ input: 'test' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input).not.toBe(wrapper.vm.display)

    await wrapper.vm.focus()

    expect(wrapper.vm.input).toBe(wrapper.vm.display)
  })

  it('should update a child when update is called for its path', async () => {
    const wrapper = factory.wrap({ leaf: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.children[0].path).not.toBe('/new.path')

    wrapper.vm.update(wrapper.vm.children[0], { path: '/new.path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.children[0].path).toBe('/new.path')
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
