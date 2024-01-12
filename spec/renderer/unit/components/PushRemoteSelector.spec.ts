import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import VTextField from '?/stubs/VTextField.vue'
import VSelect from '?/stubs/VSelect.vue'
import { createVuetify } from 'vuetify'
import PushRemoteSelector from '@/components/PushRemoteSelector.vue'

describe('components/PushRemoteSelector', () => {
  let vuetify

  const factory = assemble(PushRemoteSelector)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VCardTitle: BasicComponentStub,
          VCol: BasicComponentStub,
          VExpandTransition: BasicComponentStub,
          VIcon: BasicComponentStub,
          VRow: BasicComponentStub,
          VTextField,
          VSelect,
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
    wrapper.vm.edit = true

    expect(wrapper).toBeDefined()
  })

  it('should emit a "create" event when the create method is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.edit = true

    expect(wrapper.emitted('create')).not.toBeDefined()

    await wrapper.vm.create()

    expect(wrapper.emitted('create')).toHaveLength(1)
  })

  it('should emit a "input" event when the create method is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.edit = true

    expect(wrapper.emitted('input')).not.toBeDefined()

    const remote = {}
    await wrapper.vm.input(remote)

    expect(wrapper.emitted('input')).toHaveLength(1)
  })

  it('should invert edit flag value when edit button is clicked', async () => {
    const wrapper = factory.wrap()
    const edit = wrapper.vm.edit

    const edit_button = wrapper.findComponent({ref: 'edit-button'})
    expect(edit_button.exists()).toBe(true)

    edit_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.edit).toBe(!edit)

    edit_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.edit).toBe(edit)
  })

  it('should set form name value when form name component emits model update', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.edit = true
    wrapper.vm.form.name = 'initial name'

    const form_name_input = wrapper.findComponent({ref: 'form-name'})
    expect(form_name_input.exists()).toBe(true)

    const value = 'updated name'

    await form_name_input.vm.$emit('update:model-value', value)

    expect(wrapper.vm.form.name).toBe(value)
  })

  it('should set form url value when form url component emits model update', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.edit = true
    wrapper.vm.form.url = 'initial url'

    const form_url_input = wrapper.findComponent({ref: 'form-url'})
    expect(form_url_input.exists()).toBe(true)

    const value = 'updated url'

    await form_url_input.vm.$emit('update:model-value', value)

    expect(wrapper.vm.form.url).toBe(value)
  })
})
