import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import ContextMenuNode from '@/components/ContextMenuNode.vue'
import BasicComponentStub from '?/stubs/BasicComponent.vue'

vi.mock('resize-observer-polyfill', () => ({
  default: class {
    listener: () => void

    constructor (listener: () => void) {
      this.listener = listener
    }

    observe = vi.fn()
  },
}))

const item_none = {
  title: 'None',
  action: undefined,
}

const item_load = {
  title: 'Load',
  load: vi.fn(),
}

const item_action = {
  title: 'Action',
  action: vi.fn(),
}

describe('components/ContextMenuNode', () => {
  let vuetify

  let value
  let title = ''
  let target
  const items = []
  let position_x = 0
  let position_y = 0

  const factory = assemble(ContextMenuNode, {
    value,
    title,
    target,
    items,
    position_x,
    position_y,
  }).context(() => ({
    global: {
      plugins: [ vuetify ],
      stubs: {
        VList: BasicComponentStub,
      },
    },
  }))

  beforeEach(() => {
    vuetify = createVuetify()

    value = undefined
    title = 'Context Title'
    target = 'Context Target'

    items.length = 0
    items.push(item_none, item_load, item_action)

    position_x = 0
    position_y = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should promote the item index of the item that emits a promote event', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.promoted).toEqual(-1)

    const options = wrapper.findAllComponents({ name: 'context-menu-item' })
    expect(options).toHaveLength(3)

    {
      const index = 0
      await options[index].vm.$emit('promote')

      expect(wrapper.vm.promoted).toEqual(index)
    }

    {
      const index = 1
      await options[index].vm.$emit('promote')

      expect(wrapper.vm.promoted).toEqual(index)
    }

    {
      const index = 2
      await options[index].vm.$emit('promote')

      expect(wrapper.vm.promoted).toEqual(index)
    }
  })

  it('should emit close when an item emits a close event', async () => {
    const wrapper = factory.wrap()

    const options = wrapper.findAllComponents({ name: 'context-menu-item' })
    expect(options).toHaveLength(3)

    expect(wrapper.emitted().close).toBeFalsy()

    {
      const index = 0
      await options[index].vm.$emit('close')

      expect(wrapper.emitted().close).toHaveLength(1)
    }

    {
      const index = 1
      await options[index].vm.$emit('close')

      expect(wrapper.emitted().close).toHaveLength(2)
    }

    {
      const index = 2
      await options[index].vm.$emit('close')

      expect(wrapper.emitted().close).toHaveLength(3)
    }
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

  it('should promoted the activated item when activate is called', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.promoted).toBe(-1)

    const index = wrapper.vm.items.indexOf(item_load)
    await wrapper.vm.activate(index)

    expect(wrapper.vm.promoted).toBe(index)
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

  it('should recalculate local_position_x when position_x property is updated', async () => {
    const wrapper = factory.wrap()

    const value = wrapper.vm.local_position_x

    wrapper.setProps({ position_x: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_x).not.toEqual(value)
  })

  it('should recalculate local_position_y when position_y property is updated', async () => {
    const wrapper = factory.wrap()

    const value = wrapper.vm.local_position_y

    wrapper.setProps({ position_y: 200 })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.local_position_y).not.toEqual(value)
  })
})
