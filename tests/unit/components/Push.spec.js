import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import Push from '@/components/Push.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

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

const localVue = createLocalVue()

describe('Push.vue', () => {
  let vuetify
  let wrapper

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

    const waiting = 0
    const commit = false
    const push = false

    wrapper = mount(
      Push,
      {
        localVue,
        vuetify,
        stubs: {
          StatusButton: true
        },
        propsData: {
          waiting,
          commit,
          push
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
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
    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const event = {}

    await wrapper.vm.push(event)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/push')
  })

  it('should emit a close event after processing when push is called', async () => {
    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.push()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should call store to set credentials when select_remote is called', async () => {
    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = {
      url: 'git@git.example.com:remote.git'
    }

    await wrapper.vm.select_remote(remote)

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/credentials')
  })

  it('should call store to set remote when select_remote is called', async () => {
    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = {
      url: 'git@git.example.com:remote.git'
    }

    await wrapper.vm.select_remote(remote)

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[1][0]).toEqual('tome/remote')
  })
})
