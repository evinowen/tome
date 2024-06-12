import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import VTextField from '?/stubs/VTextField.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import SelectMenu, { Option } from '@/components/Input/SelectMenu.vue'
import { fetch_input_select_store } from '@/store/modules/input/select'

describe('components/SelectMenu', () => {
  let vuetify
  let pinia

  let value: string
  let label: string
  let options: Option[]

  const factory = assemble(SelectMenu)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VTextField,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    value = ''
    label = 'example'
    options = [
      { value: 'value-a', label: 'label-a', detail: 'detail-a' },
      { value: 'value-b', label: 'label-b', detail: 'detail-b' },
      { value: 'value-c', label: 'label-c', detail: 'detail-c' },
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap({ value, label, options })
    expect(wrapper).toBeDefined()
  })

  it('should dispatch "input/select/show" upon call to focus method', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap({ value, label, options })

    await wrapper.vm.focus(true)

    expect(input_select.show).toHaveBeenCalledWith({
      element: wrapper.vm.base,
      set: wrapper.vm.set,
      options,
    })
  })

  it('should dispatch "input/select/filter" upon call to update method', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap({ value, label, options })

    await wrapper.vm.focus(true)

    const input = 'input'
    await wrapper.vm.update(input)

    expect(input_select.filter).toHaveBeenCalledWith({
      identifier: wrapper.vm.identifier,
      value: input,
    })
  })

  it('should emit "update" upon call to set method', async () => {
    const wrapper = factory.wrap({ value, label, options })

    await wrapper.vm.set(options[0])

    expect(wrapper.emitted().update).toBeTruthy()
  })
})
