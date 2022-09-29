import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Push from '@/components/Push'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('components/Push', () => {
  let vuetify

  const factory = assemble(Push)
    .context(() => ({
      vuetify,
      stubs: { StatusButton: true }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      configuration: {
        private_key: '',
        passphrase: ''
      },
      repository: {
        name: 'Name',
        branch: 'master',
        pending: [],
        remotes: [],
        remote: {},
        repository: {},
        credentials: {
          key: '',
          passphrase: ''
        }
      },
      system: {
        push: true,
        push_confirm: false
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.diff({ oid: 1 })

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'repository/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ commit: 1 })
  })

  it('should dispatch system/perform for push when push is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const event = {}

    await wrapper.vm.push(event)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual('push')
  })

  it('should dispatch repository/remote with name when select_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = 'origin'

    await wrapper.vm.select_remote(remote)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'repository/remote')

    expect(action).toBeDefined()
    expect(data).toEqual(remote)
  })

  it('should call store to create remote when add_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const name = 'new'
    const url = 'git@git.example.com:remote.git'

    await wrapper.vm.add_remote(name, url)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('repository/create-remote')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ name, url })
  })
})
