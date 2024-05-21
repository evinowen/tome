import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import DialogComponentStub from '?/stubs/DialogComponentStub'
import { createVuetify } from 'vuetify'
import CommitConfirm, { CommitConfirmMessages } from '@/components/CommitConfirm.vue'

describe('components/CommitConfirm', () => {
  let vuetify

  const factory = assemble(CommitConfirm, { value: true })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          OverlayBox: BasicComponentStub,
          MessageInput: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VIcon: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemSubtitle: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VProgressCircular: BasicComponentStub,
          VTextarea: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set status to ready message when staging is false', async () => {
    const wrapper = factory.wrap()
    await wrapper.setProps({ staging: false })

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Ready)
  })

  it('should set status to staging message when staging is true', async () => {
    const wrapper = factory.wrap()
    await wrapper.setProps({ staging: true })

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Staging)
  })

  it('should emit "message" event when message input emits "update:model-value" event', async () => {
    // TODO: Cannot trigger "update:model-value" event
    // const wrapper = factory.wrap()

    // const message_input = wrapper.findComponent({ref: 'message-input'})
    // expect(message_input.exists()).toBe(true)

    // message_input.trigger('update:model-value')
    // await wrapper.vm.$nextTick()

    // expect(wrapper.emitted().message).toBeTruthy()
  })

  it('should emit "commit" event when commit button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const commit_button = wrapper.findComponent({ ref: 'commit-button' })
    expect(commit_button.exists()).toBe(true)

    commit_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().commit).toBeTruthy()
  })

  it('should emit "push" event when push button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const push_button = wrapper.findComponent({ ref: 'push-button' })
    expect(push_button.exists()).toBe(true)

    push_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().push).toBeTruthy()
  })

  it('should emit "close" event when return button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const return_button = wrapper.findComponent({ ref: 'return-button' })
    expect(return_button.exists()).toBe(true)

    return_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
