import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import LibraryButton from '@/components/LibraryButton.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('LibraryButton.vue', () => {
  let vuetify
  let value
  let stored

  const factory = assemble(LibraryButton, { value, stored })
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      library: {
        history: []
      },
      repository: {
        path: './tome_path'
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch library/select when select is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.select()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'library/select')

    expect(action).toBeDefined()
  })

  it('should dispatch library/open with path when open is called with a path', async () => {
    const path = '/project'

    const wrapper = factory.wrap()
    await wrapper.vm.open(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'library/open')

    expect(action).toBeDefined()
    expect(data).toBe(path)
  })

  it('should dispatch library/close when close is called', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.close()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'library/close')

    expect(action).toBeDefined()
  })
})
