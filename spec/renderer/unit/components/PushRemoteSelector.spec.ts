import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { RepositoryRemote } from '@/store/modules/repository'
import PushRemoteSelector from '@/components/PushRemoteSelector.vue'

describe('components/PushRemoteSelector', () => {
  let vuetify
  let store
  let store_dispatch
  let items: RepositoryRemote[]

  const factory = assemble(PushRemoteSelector)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          SelectMenu: BasicComponentStub,
          VBtn: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {},
      actions: stub_actions([
        'system/remotes',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    items = [ {
      name: 'repository',
      url: 'git@localhost:/username/example.git',
    } ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap({ items })

    expect(wrapper).toBeDefined()
  })

  it('should emit "update" event when select input emits "update" event', async () => {
    const wrapper = factory.wrap({ items })

    const input = wrapper.findComponent({ ref: 'input' })
    expect(input.exists()).toBe(true)

    input.vm.$emit('update')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().update).toBeTruthy()
  })

  it('should dispatch "system/remotes" when remote-button is clicked', async () => {
    items = []

    const wrapper = factory.wrap({ items })

    const remote_button = wrapper.findComponent({ ref: 'remote-button' })
    expect(remote_button.exists()).toBe(true)

    remote_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('system/remotes', true)
  })
})
