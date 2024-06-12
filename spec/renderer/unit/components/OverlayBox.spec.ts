import { describe, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import OverlayBox from '@/components/OverlayBox.vue'

describe('components/ErrorBox', () => {
  const factory = assemble(OverlayBox)

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should not set enlarge flag when overlay is clicked and secure is false', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: false })

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.enlarge).toEqual(false)
  })

  it('should not set enlarge flag when content is clicked and secure is true', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: true })

    const overlay = wrapper.find({ ref: 'content' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.enlarge).toEqual(false)
  })

  it('should set enlarge flag when overlay is clicked and secure is true', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: true })

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.enlarge).toEqual(true)
  })

  it('should set enlarge flag back to false 50ms after overlay is clicked', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: true })

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(50)
    expect(wrapper.vm.enlarge).toEqual(false)
  })

  it('should emit "click" event when overlay is clicked and secure is false', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: false })

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('should not emit "click" event when overlay is clicked and secure is true', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap({ secure: true })

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().click).toBeFalsy()
  })
})
