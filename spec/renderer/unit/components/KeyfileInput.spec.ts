import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { DOMWrapper } from '@vue/test-utils'
import KeyfileInput from '@/components/KeyfileInput.vue'
import BasicComponentStub from '?/stubs/BasicComponent.vue'

describe('components/KeyfileInput', () => {
  let vuetify

  const factory = assemble(KeyfileInput)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VCol: BasicComponentStub,
          VIcon: BasicComponentStub,
          VLayout: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not dispatch input event when update method is called and no file is selected', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const files = new FileList()
    files[0] = {} as unknown as File
    input_field.element.files = files
    input_field.trigger('change')

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().input).toBeFalsy()
  })

  it('should emit input event with path when update method is called and file is selected', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const path = '/home/user/.ssh/id_rsa'

    const files = new FileList()
    files[0] = { path } as unknown as File
    input_field.element.files = files

    await input_field.trigger('change')

    expect(wrapper.emitted().input).toHaveLength(1)
    expect(wrapper.emitted().input[0]).toEqual([ path ])
  })

  it('should emit input event with stored value when recall button emits click', async () => {
    const path = '/home/user/.ssh/id_rsa'

    const wrapper = factory.wrap({ stored: path })

    const recall_button = wrapper.findComponent({ ref: 'recall' })
    expect(recall_button.exists()).toBe(true)

    await recall_button.vm.$emit('click', { stopPropagation: vi.fn() })

    expect(wrapper.emitted().input).toHaveLength(1)
    expect(wrapper.emitted().input[0]).toEqual([ path ])
  })

  it('should emit input event with empty value when clear button emits click', async () => {
    const path = '/home/user/.ssh/id_rsa'

    const wrapper = factory.wrap({ value: path })

    const clear_button = wrapper.findComponent({ ref: 'clear' })
    expect(clear_button.exists()).toBe(true)

    await clear_button.vm.$emit('click', { stopPropagation: vi.fn() })

    expect(wrapper.emitted().input).toHaveLength(1)
    expect(wrapper.emitted().input[0]).toEqual([ '' ])
  })
})
