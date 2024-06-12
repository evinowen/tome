import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import HistoryTagCommit from '@/components/HistoryTagCommit.vue'

describe('components/HistoryTagCommit', () => {
  let vuetify

  const factory = assemble(HistoryTagCommit, { value: true })
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
          VListItemSubtitle: BasicComponentStub,
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
    const wrapper = factory.wrap({ visible: true, oid: '1234' })

    expect(wrapper).toBeDefined()
  })

  it('should emit "create" event when create-button is clicked', async () => {
    const wrapper = factory.wrap({ visible: true, oid: '1234' })

    const create_button = wrapper.findComponent({ ref: 'create-button' })
    expect(create_button.exists()).toBe(true)

    create_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().create).toBeTruthy()
  })

  it('should emit "close" event when cancel-button is clicked', async () => {
    const wrapper = factory.wrap({ visible: true, oid: '1234' })

    const cancel_button = wrapper.findComponent({ ref: 'cancel-button' })
    expect(cancel_button.exists()).toBe(true)

    cancel_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().close).toBeTruthy()
  })

  it('should reset model value when visible flag become true', async () => {
    const wrapper = factory.wrap({ visible: true, oid: '1234' })

    wrapper.vm.model = 'test-tag'
    expect(wrapper.vm.model).not.toEqual('')

    await wrapper.setProps({ visible: false })

    expect(wrapper.vm.model).not.toEqual('')

    await wrapper.setProps({ visible: true })

    expect(wrapper.vm.model).toEqual('')
  })
})
