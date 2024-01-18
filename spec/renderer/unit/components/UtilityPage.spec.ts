import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import UtilityPage from '@/components/UtilityPage.vue'

describe('components/UtilityPage', () => {
  let vuetify

  const factory = assemble(UtilityPage, { open: true })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should compute location as "left" if left flag is set', async () => {
    const wrapper = factory.wrap({ left: true })

    expect(wrapper.vm.location).toBe('left')
  })

  it('should compute location as "right" if right flag is set', async () => {
    const wrapper = factory.wrap({ right: true })

    expect(wrapper.vm.location).toBe('right')
  })

  it('should compute location as "bottom" if bottom flag is set', async () => {
    const wrapper = factory.wrap({ bottom: true })

    expect(wrapper.vm.location).toBe('bottom')
  })

  it('should compute location as "top" if top flag is set', async () => {
    const wrapper = factory.wrap({ top: true })

    expect(wrapper.vm.location).toBe('top')
  })

  it('should emit "close" event when close button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const close_button = wrapper.findComponent({ ref: 'close' })
    expect(close_button.exists()).toBe(true)

    close_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })

  it('should emit "close" event when close action button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const close_action_button = wrapper.findComponent({ ref: 'close_action' })
    expect(close_action_button.exists()).toBe(true)

    close_action_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
