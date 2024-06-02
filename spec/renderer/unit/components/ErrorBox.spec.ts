import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createTestingPinia } from '@pinia/testing'
import ErrorBox from '@/components/ErrorBox.vue'
import { fetch_error_store } from '@/store/modules/error'

describe('components/ErrorBox', () => {
  let vuetify
  let pinia

  const factory = assemble(ErrorBox)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          OverlayBox: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VCardItem: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardTitle: BasicComponentStub,
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

  it('should dispatch error/hide when confirm button is clicked', async () => {
    const error = fetch_error_store()

    const wrapper = factory.wrap()

    const confirm_button = wrapper.findComponent({ ref: 'confirm-button' })
    expect(confirm_button.exists()).toBe(true)

    confirm_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(error.hide).toHaveBeenCalledWith()
  })

  it('should dispatch error/help when help button is clicked', async () => {
    const error = fetch_error_store()

    error.help_tag = 'help-topic'

    const wrapper = factory.wrap()

    const help_button = wrapper.findComponent({ ref: 'help-button' })
    expect(help_button.exists()).toBe(true)

    help_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(error.help).toHaveBeenCalledWith()
  })
})
