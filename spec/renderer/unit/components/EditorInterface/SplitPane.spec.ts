import { describe, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import SplitPane from '@/components/EditorInterface/SplitPane.vue'

HTMLElement.prototype.setPointerCapture = vi.fn()
HTMLElement.prototype.releasePointerCapture = vi.fn()

describe('components/EditorInterface/SplitPane', () => {
  const factory = assemble(SplitPane)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should start resize with event data with call to resize_start', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_start(resize_start_event)

    expect(wrapper.vm.resizing).toBeTruthy()
    expect(wrapper.vm.width).toEqual(wrapper.vm.resized.offsetWidth)
    expect(wrapper.vm.origin).toEqual(wrapper.vm.resized.offsetWidth)
    expect(wrapper.vm.offset).toEqual(resize_start_event.pageX)
  })

  it('should recalculate resize with event data with call to resize_move for left', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_start(resize_start_event)

    const last_origin = wrapper.vm.origin
    const last_offset = wrapper.vm.offset

    const resize_move_event = {
      pageX: 2000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_move(resize_move_event)

    expect(wrapper.vm.resizing).toBeTruthy()
    expect(wrapper.vm.width).toEqual(last_origin - last_offset + resize_move_event.pageX)
    expect(wrapper.vm.origin).toEqual(last_origin)
    expect(wrapper.vm.offset).toEqual(last_offset)
  })

  it('should recalculate resize with event data with call to resize_move for right', async () => {
    const wrapper = factory.wrap({ docked: 'right' })

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_start(resize_start_event)

    const last_origin = wrapper.vm.origin
    const last_offset = wrapper.vm.offset

    const resize_move_event = {
      pageX: 2000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_move(resize_move_event)

    expect(wrapper.vm.resizing).toBeTruthy()
    expect(wrapper.vm.width).toEqual(last_origin + last_offset - resize_move_event.pageX)
    expect(wrapper.vm.origin).toEqual(last_origin)
    expect(wrapper.vm.offset).toEqual(last_offset)
  })

  it('should skip resize recalculate with call to resize_move while not resizing', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const last_width = wrapper.vm.width
    const last_origin = wrapper.vm.origin
    const last_offset = wrapper.vm.offset

    const resize_move_event = {
      pageX: 2000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_move(resize_move_event)

    expect(wrapper.vm.resizing).toBeFalsy()
    expect(wrapper.vm.width).toEqual(last_width)
    expect(wrapper.vm.origin).toEqual(last_origin)
    expect(wrapper.vm.offset).toEqual(last_offset)
  })

  it('should end resize with call to resize_end', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_start(resize_start_event)

    expect(wrapper.vm.resizing).toBeTruthy()

    const resize_end_event = {
      pointerId: Math.floor(Math.random() * 1000),
    } as PointerEvent

    wrapper.vm.resize_end(resize_end_event)

    expect(wrapper.vm.resizing).toBeFalsy()
  })

  it('should update internal width when width property is updated', async () => {
    const wrapper = factory.wrap()

    const last_width = wrapper.vm.width
    const new_width = (last_width + 1) * 2

    wrapper.setProps({ docked_width: new_width })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.width).not.toEqual(last_width)
    expect(wrapper.vm.width).toEqual(new_width)
  })
})
