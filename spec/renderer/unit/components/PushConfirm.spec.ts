import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import DialogComponentStub from '?/stubs/DialogComponentStub'
import VDataTable from '?/stubs/VDataTable.vue'
import { createVuetify } from 'vuetify'
import PushConfirm from '@/components/PushConfirm.vue'

describe('components/PushConfirm', () => {
  let vuetify

  const factory = assemble(PushConfirm, { value: true })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VDialog: DialogComponentStub,
          VIcon: BasicComponentStub,
          VListItemItem: BasicComponentStub,
          VListItemSubtitle: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VProgressCircular: BasicComponentStub,
          VTextarea: BasicComponentStub,
          VDataTable,
        }
      }
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

  it('should emit "push" event when push button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const push_button = wrapper.findComponent({ref: 'push_confirm'})
    expect(push_button.exists()).toBe(true)

    push_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().push).toBeTruthy()
  })

  it('should emit "input" event when return button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const return_button = wrapper.findComponent({ref: 'return'})
    expect(return_button.exists()).toBe(true)

    return_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().input).toBeTruthy()
  })
})
