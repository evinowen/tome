import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import KeyfileInput from '@/components/KeyfileInput.vue'

describe('components/KeyfileInput', () => {
  let vuetify

  const factory = assemble(KeyfileInput)
    .context(() => ({
      vuetify
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should have red color value when component has no value', async () => {
    const wrapper = factory.wrap({ value: '' })
    const local = wrapper.vm as KeyfileInput

    expect(local.color).toEqual('red')
  })

  it('should have green color value when component has a value', async () => {
    const wrapper = factory.wrap({ value: '/id_rsa' })
    const local = wrapper.vm as KeyfileInput

    expect(local.color).toEqual('green')
  })

  it('should emit "input" event when input method is called and file is selected', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as KeyfileInput
    local.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    const input_event = {
      target: {
        files: [
          { path: './test_key.pub' }
        ]
      }
    }

    await local.input(input_event)

    expect(event).toHaveBeenCalledTimes(1)
  })
})
