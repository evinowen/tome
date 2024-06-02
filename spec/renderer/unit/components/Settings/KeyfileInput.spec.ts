import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { DOMWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import KeyfileInput from '@/components/Settings/KeyfileInput.vue'
import { fetch_configuration_store } from '@/store/modules/configuration'

vi.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
}))

describe('components/Settings/KeyfileInput', () => {
  let vuetify
  let pinia

  const label = 'private key'
  const index = 'private_key'
  const passphrase = 'password'

  const factory = assemble(KeyfileInput, { label, index })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'configuration': {
          private_key: '/home/user/.ssh/id_rsa',
          passphrase,
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not dispatch configuration/update when update method is called and no file is selected', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const path = './index.md'

    const files = new FileList()
    files[0] = {} as unknown as File
    input_field.element.files = files
    await input_field.trigger('change')

    const data = { [index]: path }
    expect(configuration.update).not.toHaveBeenCalledWith(data)
  })

  it('should dispatch configuration/update when update method is called and file is selected', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()

    const input_field = wrapper.find({ ref: 'input' }) as DOMWrapper<HTMLInputElement>
    expect(input_field.exists()).toBe(true)

    const path = './index.md'

    const files = new FileList()
    files[0] = { path } as unknown as File
    input_field.element.files = files
    await input_field.trigger('change')

    const data = { [index]: path }
    expect(configuration.update).toHaveBeenCalledWith(data)
  })

  it('should dispatch configuration/update with empty value when clear button emits click', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()

    const clear_button = wrapper.findComponent({ ref: 'clear-button' })

    expect(clear_button.exists()).toBe(true)
    await clear_button.trigger('click')

    const data = { [index]: '' }
    expect(configuration.update).toHaveBeenCalledWith(data)
  })

  it('should dispatch configuration/generate when generate button is clicked', async () => {
    const configuration = fetch_configuration_store()

    configuration.private_key = ''

    const wrapper = factory.wrap()

    const generate_button = wrapper.findComponent({ ref: 'generate-button' })
    expect(generate_button.exists()).toBe(true)
    await generate_button.trigger('click')

    expect(configuration.generate).toHaveBeenCalledWith(passphrase)
  })
})
