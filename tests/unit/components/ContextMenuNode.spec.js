import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ContextMenuNode from '@/components/ContextMenuNode.vue'

global.ResizeObserver = class {
  constructor (listener) {
    this.listener = listener
  }

  observe (object) {

  }
}

Vue.use(Vuetify)

const item_none = {
  title: 'None',
  action: null
}

const item_load = {
  title: 'Load',
  load: jest.fn()
}

const item_action = {
  title: 'Action',
  action: jest.fn()
}

describe('ContextMenuNode.vue', () => {
  let vuetify

  let value = null
  let title = ''
  let target = null
  const items = []
  let position_x = 0
  let position_y = 0

  const factory = assemble(ContextMenuNode, {
    value,
    title,
    target,
    items,
    position_x,
    position_y
  }).context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    value = null
    title = 'Context Title'
    target = 'Context Target'

    items.length = 0
    items.push(item_none, item_load, item_action)

    position_x = 0
    position_y = 0
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set the current promoted item when calling promote', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.promoted).toBe(-1)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.promote(index)

    expect(wrapper.vm.promoted).toBe(index)
  })

  it('should load items as provided when calling promote', async () => {
    const wrapper = factory.wrap()

    expect(item_load.load).toHaveBeenCalledTimes(0)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.promote(index)

    expect(item_load.load).toHaveBeenCalledTimes(1)
  })

  it('should call promote for index when activate is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.promote = jest.fn()

    expect(wrapper.vm.promote).toHaveBeenCalledTimes(0)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.activate(index)

    expect(wrapper.vm.promote).toHaveBeenCalledTimes(1)
  })

  it('should set active to index when activate is called', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toBe(-1)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.activate(index)

    expect(wrapper.vm.active).toBe(index)
  })

  it('should set active to -1 when deactivate is called for correct index', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toBe(-1)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.activate(index)

    expect(wrapper.vm.active).toBe(index)

    await wrapper.vm.deactivate(index)

    expect(wrapper.vm.active).toBe(-1)
  })

  it('should return when execute is called and no action is provded', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.execute()
  })

  it('should call action when execute is called and action is provded', async () => {
    const wrapper = factory.wrap()

    const action = jest.fn()

    expect(action).toHaveBeenCalledTimes(0)

    await wrapper.vm.execute(action)

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('should emit close when execute is called and action is provded', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('close', event)

    const action = jest.fn()

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.execute(action)

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should recalculate local_position_x when position_x property is updated', async () => {
    const wrapper = factory.wrap()

    const value = wrapper.vm.local_position_x

    wrapper.vm.$refs.node.calcXOverflow = jest.fn(() => 100)
    wrapper.setProps({ position_x: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_x).not.toEqual(value)
  })

  it('should recalculate local_position_y when position_y property is updated', async () => {
    const wrapper = factory.wrap()

    const value = wrapper.vm.local_position_y

    wrapper.vm.$refs.node.calcYOverflow = jest.fn(() => 100)
    wrapper.setProps({ position_y: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_y).not.toEqual(value)
  })
})
