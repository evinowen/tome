import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import SplitPane from '@/components/EditorInterface/SplitPane.vue'

describe('components/EditorInterface/SplitPane', () => {
  const factory = assemble(SplitPane)

  beforeEach(() => {
  })

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
    }

    wrapper.vm.resize_start(resize_start_event)

    expect(wrapper.vm.resizing).toBeTruthy()
    expect(wrapper.vm.width).toEqual(wrapper.vm.resized.offsetWidth)
    expect(wrapper.vm.origin).toEqual(resize_start_event.pageX)
  })

  it('should recalculate resize with event data with call to resize_move', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
    }

    wrapper.vm.resize_start(resize_start_event)

    const last_width = wrapper.vm.width
    const last_origin = wrapper.vm.origin

    const resize_move_event = {
      pageX: 2000,
    }

    wrapper.vm.resize_move(resize_move_event)

    expect(wrapper.vm.resizing).toBeTruthy()
    expect(wrapper.vm.width).toEqual(last_width + resize_move_event.pageX - last_origin)
    expect(wrapper.vm.origin).toEqual(resize_move_event.pageX)
  })

  it('should skip resize recalculate with call to resize_move while not resizing', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const last_width = wrapper.vm.width
    const last_origin = wrapper.vm.origin

    const resize_move_event = {
      pageX: 2000,
    }

    wrapper.vm.resize_move(resize_move_event)

    expect(wrapper.vm.resizing).toBeFalsy()
    expect(wrapper.vm.width).toEqual(last_width)
    expect(wrapper.vm.origin).toEqual(last_origin)
  })

  it('should end resize with call to resize_end', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.resizing).toBeFalsy()

    const resize_start_event = {
      pageX: 1000,
    }

    wrapper.vm.resize_start(resize_start_event)

    expect(wrapper.vm.resizing).toBeTruthy()

    wrapper.vm.resize_end()

    expect(wrapper.vm.resizing).toBeFalsy()
  })
})
