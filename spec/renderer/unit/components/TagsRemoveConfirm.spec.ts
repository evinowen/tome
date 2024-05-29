import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import TagsRemoveConfirm from '@/components/TagsRemoveConfirm.vue'

describe('components/BranchesRemoveConfirm', () => {
  let vuetify

  const factory = assemble(TagsRemoveConfirm, { visible: true, tag: 'v1.0.0' })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          OverlayBox: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VIcon: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemSubtitle: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VProgressCircular: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should emit "remove" event when remove button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const remove_button = wrapper.findComponent({ ref: 'remove-button' })
    expect(remove_button.exists()).toBe(true)

    await remove_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().remove).toBeTruthy()
  })

  it('should emit "close" event when cancel button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const cancel_button = wrapper.findComponent({ ref: 'cancel-button' })
    expect(cancel_button.exists()).toBe(true)

    await cancel_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
