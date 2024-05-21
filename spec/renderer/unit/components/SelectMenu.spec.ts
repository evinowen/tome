import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import VTextField from '?/stubs/VTextField.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as InputSelectStateDefaults } from '@/store/modules/input/select'
import SelectMenu, { Option } from '@/components/SelectMenu.vue'

describe('components/SelectMenu', () => {
  let vuetify
  let store
  let store_dispatch

  let value: string
  let label: string
  let options: Option[]

  const factory = assemble(SelectMenu)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VTextField,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        input: {
          select: InputSelectStateDefaults(),
        },
      },
      actions: stub_actions([
        'input/select/show',
        'input/select/filter',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

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
    const wrapper = factory.wrap({ value, label, options })

    await wrapper.vm.focus(true)

    expect(store_dispatch).toHaveBeenCalledWith('input/select/show', {
      element: wrapper.vm.base,
      set: wrapper.vm.set,
      options,
    })
  })

  it('should dispatch "input/select/filter" upon call to update method', async () => {
    const wrapper = factory.wrap({ value, label, options })

    await wrapper.vm.focus(true)

    const input = 'input'
    await wrapper.vm.update(input)

    expect(store_dispatch).toHaveBeenCalledWith('input/select/filter', {
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
