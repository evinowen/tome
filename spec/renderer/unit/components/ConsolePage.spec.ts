import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import ConsolePage from '@/components/ConsolePage.vue'

describe('components/FileIcon', () => {
  let vuetify

  const factory = assemble(ConsolePage, { open: true })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
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

  it('should emit "close" event when close button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const close_button = wrapper.findComponent({ ref: 'close' })
    expect(close_button.exists()).toBe(true)

    close_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
