import Vue from 'vue'
import Vuetify from 'vuetify'

import ExplorerFile from '@/components/ExplorerFile.vue'

Vue.use(Vuetify)

describe('ExplorerFile.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const prepare = () => ({ context: { vuetify, stubs: { ExplorerDirectory: true } } })

  const wrap = factory(ExplorerFile, prepare,  {
    name: 'Name',
    path: '/pa/th/to/fi/le',
    active: 'Active',
    populate: null,
    new_file: null,
    new_folder: null,
    open_folder: null,
    highlight: 'Highlight',
    directory: false,
    parent: {},
  })

  it('should be flagged as system if the filename equals .git', async () => {
    wrap({ name: '.git' })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should emit a drag event when a drag starts with this component', async () => {
    const wrapper = wrap()
    await wrapper.vm.$nextTick()

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
    const wrapper = wrap()
    await wrapper.vm.$nextTick()

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
    const wrapper = wrap()
    await wrapper.vm.$nextTick()

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
    const wrapper = wrap()
    await wrapper.vm.$nextTick()

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

  it('should relay calls to create to its parent node', async () => {
    const parent = { create: jest.fn() }
    const wrapper = wrap({ parent })
    await wrapper.vm.$nextTick()

    expect(parent.create).toHaveBeenCalledTimes(0)

    await wrapper.vm.create(true, '/new.path')

    expect(parent.create).toHaveBeenCalledTimes(1)
  })

  it('should emit submit event when submit is called', async () => {
    const wrapper = wrap()
    wrapper.setData({ valid: true })
    await wrapper.vm.$nextTick()

    const event = jest.fn()
    wrapper.vm.$on('submit', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.submit()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should refresh input field value when focus is called', async () => {
    const wrapper = wrap()
    wrapper.setData({ input: 'test' })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.input).not.toBe(wrapper.vm.display)

    await wrapper.vm.focus()

    expect(wrapper.vm.input).toBe(wrapper.vm.display)
  })
})
