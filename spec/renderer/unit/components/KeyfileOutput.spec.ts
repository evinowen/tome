import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import KeyfileOutput from '@/components/KeyfileOutput.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('components/KeyfileOutput', () => {
  let vuetify

  const factory = assemble(KeyfileOutput)
    .context(() => ({
      vuetify
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch clipboard/text with the component value when copy is called', async () => {
    const value = 'ssh-rsa 1245'
    const wrapper = factory.wrap({ value })
    const local = wrapper.vm as KeyfileOutput

    await local.copy()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/text')

    expect(action).toBeDefined()
    expect(data).toEqual(value)
  })
})
