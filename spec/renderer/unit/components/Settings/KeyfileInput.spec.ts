import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { DOMWrapper } from '@vue/test-utils'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import KeyfileInput from '@/components/Settings/KeyfileInput.vue'

describe('components/Settings/KeyfileInput', () => {
  let vuetify
  let store
  let store_dispatch

  const label = 'private key'
  const index = 'private_key'
  const passphrase = 'password'

  const factory = assemble(KeyfileInput, { label, index })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: {
          ...ConfigurationStateDefaults(),
          private_key: '/home/user/.ssh/id_rsa',
          passphrase,
        },
      },
      actions: stub_actions([
        'configuration/update',
        'configuration/generate',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not dispatch configuration/update when update method is called and no file is selected', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const path = './index.md'

    const files = new FileList()
    files[0] = {} as unknown as File
    input_field.element.files = files
    input_field.trigger('change')

    await wrapper.vm.$nextTick()

    const data = { [index]: path }
    expect(store_dispatch).not.toHaveBeenCalledWith('configuration/update', data)
  })

  it('should dispatch configuration/update when update method is called and file is selected', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const path = './index.md'

    const files = new FileList()
    files[0] = { path } as unknown as File
    input_field.element.files = files
    await input_field.trigger('change')

    const data = { [index]: path }
    expect(store_dispatch).toHaveBeenCalledWith('configuration/update', data)
  })

  it('should dispatch configuration/update with empty value when clear button emits click', async () => {
    const wrapper = factory.wrap()

    const clear_button = wrapper.findComponent({ ref: 'clear' })
    expect(clear_button.exists()).toBe(true)

    await clear_button.trigger('click')

    const data = { [index]: '' }
    expect(store_dispatch).toHaveBeenCalledWith('configuration/update', data)
  })

  it('should dispatch configuration/generate when generate button is clicked', async () => {
    store.state.configuration.private_key = ''

    const wrapper = factory.wrap()

    const generate_button = wrapper.findComponent({ ref: 'generate' })
    expect(generate_button.exists()).toBe(true)
    await generate_button.trigger('click')

    expect(store_dispatch).toHaveBeenCalledWith('configuration/generate', passphrase)
  })
})
