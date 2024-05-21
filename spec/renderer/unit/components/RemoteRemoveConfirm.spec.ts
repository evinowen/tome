import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import RemoteRemoveConfirm from '@/components/RemoteRemoveConfirm.vue'

describe('components/RemoteRemoveConfirm', () => {
  let vuetify

  const factory = assemble(RemoteRemoveConfirm, { value: true })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          OverlayBox: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VCardText: BasicComponentStub,
          VIcon: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VSpacer: BasicComponentStub,
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
    const wrapper = factory.wrap({ visible: true, name: 'remote' })

    expect(wrapper).toBeDefined()
  })

  it('should emit "remove" event when remove-button is clicked', async () => {
    const wrapper = factory.wrap({ visible: true, name: 'remote' })

    const remove_button = wrapper.findComponent({ ref: 'remove-button' })
    expect(remove_button.exists()).toBe(true)

    remove_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().remove).toBeTruthy()
  })

  it('should emit "cancel" event when cancel-button is clicked', async () => {
    const wrapper = factory.wrap({ visible: true, name: 'remote' })

    const cancel_button = wrapper.findComponent({ ref: 'cancel-button' })
    expect(cancel_button.exists()).toBe(true)

    cancel_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().cancel).toBeTruthy()
  })
})
