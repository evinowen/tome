import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ConsoleButton from '@/components/ActionBar/ConsoleButton.vue'
import { fetch_system_store } from '@/store/modules/system'

describe('components/ActionBar/ConsoleButton', () => {
  let vuetify
  let pinia

  const factory = assemble(ConsoleButton)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should dispatch "system/console" action when button is clicked', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    expect(button.exists()).toBe(true)

    button.trigger('click')
    await wrapper.vm.$nextTick()

    const open = system.console

    expect(system.page).toHaveBeenCalledWith({ console: !open })
  })
})
