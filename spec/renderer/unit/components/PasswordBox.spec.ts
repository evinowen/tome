import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createTestingPinia } from '@pinia/testing'
import PasswordBox from '@/components/PasswordBox.vue'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'

describe('components/PasswordBox', () => {
  let vuetify
  let pinia

  const factory = assemble(PasswordBox)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          OverlayBox: BasicComponentStub,
          TextInput: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VIcon: BasicComponentStub,
          VSpacer: BasicComponentStub,
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

  it('should clear model value when repository_credentials.visible changes', async () => {
    const repository_credentials = fetch_repository_credentials_store()
    repository_credentials.visible = true

    const wrapper = factory.wrap()
    wrapper.vm.model = 'test-input'

    repository_credentials.visible = false
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.model).toEqual('')
  })

  it('should call repository_credentials.submit when submit button is clicked', async () => {
    const repository_credentials = fetch_repository_credentials_store()

    const wrapper = factory.wrap()

    const submit_button = wrapper.findComponent({ ref: 'submit-button' })
    expect(submit_button.exists()).toBe(true)

    submit_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(repository_credentials.submit).toHaveBeenCalledWith(wrapper.vm.model)
  })

  it('should call repository_credentials.cancel when cancel button is clicked', async () => {
    const repository_credentials = fetch_repository_credentials_store()

    const wrapper = factory.wrap()

    const cancel_button = wrapper.findComponent({ ref: 'cancel-button' })
    expect(cancel_button.exists()).toBe(true)

    cancel_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(repository_credentials.cancel).toHaveBeenCalledWith()
  })
})
