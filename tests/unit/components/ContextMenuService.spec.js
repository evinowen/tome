import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ContextMenuService from '@/components/ContextMenuService.vue'

Vue.use(Vuetify)

describe('ContextMenuService.vue', () => {
  let vuetify
  const items = []

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

  beforeEach(() => {
    vuetify = new Vuetify()

    items.length = 0
    items.push(item_none, item_load, item_action)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(ContextMenuService, {
    value: null,
    target: '/project/file.md',
    target: '/project/file.md',
    items: items,
    position_x: 100,
    position_y: 100
  }).context(() => ({ vuetify }))

  it('should load items as they are expanded when configured to do so', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(item_load.load).toHaveBeenCalledTimes(0)

    wrapper.vm.$refs.root.expanded = wrapper.vm.items.indexOf(item_load)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(item_load.load).toHaveBeenCalledTimes(1)
  })

  it('should not load items when not configured to do so', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.root.expanded = wrapper.vm.items.indexOf(item_action)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
  })

  it('should take no action when expanded is set to invalid number', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.root.expanded = -1
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
  })

})
