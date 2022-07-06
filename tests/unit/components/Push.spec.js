import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import { assemble } from '@/../tests/helpers'
import Push from '@/components/Push.vue'
import store from '@/store'

Vue.use(Vuetify)

jest.mock('electron', () => ({
  remote: {
    dialog: jest.fn()
  }

}))

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

remote.dialog = {
  showOpenDialog: jest.fn()
}

describe('Push.vue', () => {
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
        public_key: '',
        passphrase: ''
      },
      tome: {
        name: 'Name',
        branch: 'master',
        pending: [],
        remotes: [],
        remote: {},
        repository: {}
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should pull configuration if it exists into local input when the component is mounted', async () => {
    store.state.configuration.private_key = './id_rsa'
    store.state.configuration.public_key = './id_rsa.pub'
    store.state.configuration.passphrase = 'password'

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const wrapper = factory.wrap()

    expect(wrapper.vm.input.private_key.value).toEqual('./id_rsa')
    expect(wrapper.vm.input.public_key.value).toEqual('./id_rsa.pub')
    expect(wrapper.vm.input.passphrase.value).toEqual('password')
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const commit = {
      oid: 1
    }

    await wrapper.vm.diff(commit)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/diff')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ commit: 1 })
  })

  it('should call store to push when push is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const event = {}

    await wrapper.vm.push(event)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/push')
  })

  it('should emit a close event after processing when push is called', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.push()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should call store to set credentials when select_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = {
      url: 'git@git.example.com:remote.git'
    }

    await wrapper.vm.select_remote(remote)

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/credentials')
  })

  it('should call store to set remote when select_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = {
      url: 'git@git.example.com:remote.git'
    }

    await wrapper.vm.select_remote(remote)

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[1][0]).toEqual('tome/remote')
  })

  it('should call store to create remote when add_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const name = 'new'
    const url = 'git@git.example.com:remote.git'

    await wrapper.vm.add_remote(name, url)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/create-remote')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ name, url })
  })
})
