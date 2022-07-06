import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import PushPassphraseInput from '@/components/PushPassphraseInput.vue'

Vue.use(Vuetify)

describe('PushPassphraseInput.vue', () => {
  let vuetify

  const factory = assemble(PushPassphraseInput)
    .context(() => ({}))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)

      vuetify = new Vuetify()
      context.vuetify = vuetify
    })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set the load button color to "grey" when there is no stored value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.button_color).toEqual('grey')
  })

  it('should set the load button color to "orange" when there is a stored value', async () => {
    const wrapper = factory.wrap()

    await wrapper.setProps({ stored: './test_key.pub' })

    expect(wrapper.vm.button_color).toEqual('orange')
  })
})
