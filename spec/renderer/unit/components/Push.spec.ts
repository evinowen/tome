import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Push from '@/components/Push.vue'

jest.mock('@/store', () => ({
  state: {
    configuration: {
      private_key: '',
      passphrase: ''
    },
    repository: {
      name: 'Name',
      branch: 'master',
      pending: [],
      remotes: [],
      remote: {
        name: '',
        url: '',
        branch: {
          name: '',
          short: '',
          error: ''
        }
      },
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
  }, dispatch: jest.fn() }))

describe('components/Push', () => {
  let vuetify

  const factory = assemble(Push)
    .context(() => ({
      vuetify,
      stubs: { StatusButton: true }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
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
    const local = wrapper.vm as Push

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.diff({ oid: 1 })

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ commit: 1 })
  })

  it('should dispatch system/perform for push when push is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Push

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.push()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual('push')
  })

  it('should dispatch repository/remote with name when select_remote is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Push

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = 'origin'

    await local.select_remote(remote)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/remote')

    expect(action).toBeDefined()
    expect(data).toEqual(remote)
  })

  it('should call store to create remote when add_remote is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Push

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const name = 'new'
    const url = 'git@git.example.com:remote.git'

    await local.add_remote(name, url)

    const mocked_store = jest.mocked(store)
    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toEqual('repository/create-remote')
    expect(mocked_store.dispatch.mock.calls[0][1]).toEqual({ name, url })
  })
})
