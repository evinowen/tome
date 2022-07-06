import Vue from 'vue'
import Vuetify from 'vuetify'

import ContextMenuNode from '@/components/ContextMenuNode.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('ContextMenuNode.vue', () => {
  let vuetify
  let wrapper

  let value
  let title
  let target
  let items
  let position_x
  let position_y

  beforeEach(() => {
    vuetify = new Vuetify()

    value = null
    title = 'Context Title'
    target = 'Context Target'
    items = [{
      load: jest.fn(() => [{ title: 'Item' }]),
      items: null
    }]
    position_x = 0
    position_y = 0

    wrapper = mount(
      ContextMenuNode,
      {
        localVue,
        vuetify,
        propsData: {
          value,
          title,
          target,
          items,
          position_x,
          position_y
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should recalculate local_position_x when position_x property is updated', async () => {
    expect(wrapper.vm.local_position_x).toEqual(0)

    wrapper.vm.$refs.node.calcXOverflow = jest.fn(() => 100)
    wrapper.setProps({ position_x: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_x).toEqual(100)
  })

  it('should recalculate local_position_y when position_y property is updated', async () => {
    expect(wrapper.vm.local_position_y).toEqual(0)

    wrapper.vm.$refs.node.calcYOverflow = jest.fn(() => 100)
    wrapper.setProps({ position_y: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_y).toEqual(100)
  })

  it('should load items for menu node if expanded is a valid index', async () => {
    expect(wrapper.vm.expanded).toEqual(null)
    await wrapper.setData({ expanded: 0 })

    expect(items[0].load).toHaveBeenCalledTimes(1)
  })
})
