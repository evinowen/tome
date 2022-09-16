import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import KeyfileInput from '@/components/KeyfileInput.vue'

describe('KeyfileInput.vue', () => {
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

    expect(wrapper.vm.color).toEqual('red')
  })

  it('should have green color value when component has a value', async () => {
    const wrapper = factory.wrap({ value: '/id_rsa' })

    expect(wrapper.vm.color).toEqual('green')
  })

  it('should emit "input" event when input method is called and file is selected', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    const input_event = {
      target: {
        files: [
          { path: './test_key.pub' }
        ]
      }
    }

    await wrapper.vm.input(input_event)

    expect(event).toHaveBeenCalledTimes(1)
  })
})
