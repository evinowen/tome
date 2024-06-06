import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import SelectMenu from '@/components/Input/SelectMenu.vue'
import { fetch_input_select_store } from '@/store/modules/input/select'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  get: vi.fn(),
}))

describe('components/Settings/SelectMenu', () => {
  let vuetify
  let pinia

  const label = 'name'
  const value = 'option-a'
  const options = [
    { value: 'option-a', label: 'Option A' },
    { value: 'option-b', label: 'Option B' },
    { value: 'option-c', label: 'Option C' },
  ]

  const factory = assemble(SelectMenu, { label, value, options })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VTextField: BasicComponentStub,
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

  it('should store identifier value returned by input_select.show upon call to focus', async () => {
    const identifier = '1234'
    const input_select = fetch_input_select_store()
    input_select.show = vi.fn(async () => identifier)

    const wrapper = factory.wrap()

    await wrapper.vm.focus()

    expect(wrapper.vm.identifier).toEqual(identifier)
  })

  it('should set open flag to true when input_select.identify matches identifier value', async () => {
    const identifier = '1234'
    const input_select = fetch_input_select_store()
    input_select.show = vi.fn(async () => identifier)

    const wrapper = factory.wrap()

    await wrapper.vm.focus()
    input_select.identifier = identifier

    expect(wrapper.vm.identifier).toEqual(input_select.identifier)
    expect(wrapper.vm.open).toEqual(true)
  })

  it('should clear identifier value upon call to blur', async () => {
    const identifier = '1234'
    const input_select = fetch_input_select_store()
    input_select.show = vi.fn(async () => identifier)

    const wrapper = factory.wrap()

    await wrapper.vm.focus()
    await wrapper.vm.blur()

    expect(wrapper.vm.identifier).toEqual('')
  })

  it('should set open flag to false when input_select.identify does not match identifier value', async () => {
    const identifier = '1234'
    const input_select = fetch_input_select_store()
    input_select.show = vi.fn(async () => identifier)

    const wrapper = factory.wrap()

    await wrapper.vm.focus()
    input_select.identifier = '5678'

    expect(wrapper.vm.identifier).not.toEqual(input_select.identifier)
    expect(wrapper.vm.open).toEqual(false)
  })

  it('should call input_select.filter upon call to update method', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap()
    await wrapper.vm.update('opt')

    expect(input_select.filter).toHaveBeenCalled()
  })

  it('should call input_select.filter when value property is updated', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap()
    wrapper.setProps({ value: 'option-c' })

    await wrapper.vm.$nextTick()

    expect(input_select.filter).toHaveBeenCalled()
  })

  it('should emit update event upon call to set method', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.set(options[0])

    expect(wrapper.emitted().update).toBeTruthy()
    wrapper.emitted().update.with
  })

  it('should emit update event with new value upon call to set method', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.set(options[0])

    expect(wrapper.emitted().update[0]).toEqual([ options[0].value ])
  })
})
