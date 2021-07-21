import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import Branch from '@/components/Branch.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

Vue.use(Vuetify)

jest.mock('electron', () => ({
  remote: {
    dialog: jest.fn()
  }

}))

remote.dialog = {
  showOpenDialog: jest.fn()
}

const localVue = createLocalVue()

describe('Branch.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      tome: {
        history: []
      }
    }

    const value = true

    wrapper = mount(
      Branch,
      {
        localVue,
        vuetify,
        stubs: {
          StatusButton: true
        },
        propsData: {
          value
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const event = jest.fn()

    wrapper.vm.$on('edit', event)

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const commit = {
      oid: 1
    }

    await wrapper.vm.diff(commit)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/diff')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ commit: 1 })
  })

  it('should emit patch event when diff is called', async () => {
    const event = jest.fn()

    wrapper.vm.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    const commit = {
      oid: 1
    }

    await wrapper.vm.diff(commit)

    expect(event).toHaveBeenCalledTimes(1)
  })
})
