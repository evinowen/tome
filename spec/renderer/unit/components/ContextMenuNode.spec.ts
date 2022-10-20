import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import ContextMenuNode from '@/components/ContextMenuNode.vue'

jest.mock('resize-observer-polyfill', () => class {
  listener: () => void
  constructor (listener) {
    this.listener = listener
  }

  observe () {
    // do nothing
  }
})

const item_none = {
  title: 'None',
  action: undefined
}

const item_load = {
  title: 'Load',
  load: jest.fn()
}

const item_action = {
  title: 'Action',
  action: jest.fn()
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
    position_y
  }).context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    value = undefined
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
    const local = wrapper.vm as ContextMenuNode

    expect(local.promoted).toBe(-1)

    const index = local.items.indexOf(item_load)
    await local.promote(index)

    expect(local.promoted).toBe(index)
  })

  it('should load items as provided when calling promote', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    expect(item_load.load).toHaveBeenCalledTimes(0)

    const index = local.items.indexOf(item_load)
    await local.promote(index)

    expect(item_load.load).toHaveBeenCalledTimes(1)
  })

  it('should call promote for index when activate is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode
    local.promote = jest.fn()

    expect(local.promote).toHaveBeenCalledTimes(0)

    const index = local.items.indexOf(item_load)
    await local.activate(index)

    expect(local.promote).toHaveBeenCalledTimes(1)
  })

  it('should set active to index when activate is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    expect(local.active).toBe(-1)

    const index = local.items.indexOf(item_load)
    await local.activate(index)

    expect(local.active).toBe(index)
  })

  it('should set active to -1 when deactivate is called for correct index', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    expect(local.active).toBe(-1)

    const index = local.items.indexOf(item_load)
    await local.activate(index)

    expect(local.active).toBe(index)

    await local.deactivate(index)

    expect(local.active).toBe(-1)
  })

  it('should return when execute is called and no action is provded', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    // eslint-disable-next-line unicorn/no-useless-undefined
    await local.execute(undefined)
  })

  it('should call action when execute is called and action is provded', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    const action = jest.fn()

    expect(action).toHaveBeenCalledTimes(0)

    await local.execute(action)

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('should emit close when execute is called and action is provded', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode
    local.$on('close', event)

    const action = jest.fn()

    expect(event).toHaveBeenCalledTimes(0)

    await local.execute(action)

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should recalculate local_position_x when position_x property is updated', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    const value = local.local_position_x

    wrapper.setProps({ position_x: 200 })

    await local.$nextTick()

    expect(local.local_position_x).not.toEqual(value)
  })

  it('should recalculate local_position_y when position_y property is updated', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ContextMenuNode

    const value = local.local_position_y

    wrapper.setProps({ position_y: 200 })

    await local.$nextTick()

    expect(local.local_position_y).not.toEqual(value)
  })
})
