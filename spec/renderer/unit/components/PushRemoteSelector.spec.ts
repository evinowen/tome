import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { RepositoryRemote } from '@/api'
import PushRemoteSelector from '@/components/PushRemoteSelector.vue'
import { fetch_system_store } from '@/store/modules/system'

describe('components/PushRemoteSelector', () => {
  let vuetify
  let pinia
  let items: RepositoryRemote[]

  const factory = assemble(PushRemoteSelector)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          SelectMenu: BasicComponentStub,
          VBtn: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

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
    const system = fetch_system_store()

    items = []

    const wrapper = factory.wrap({ items })

    const remote_button = wrapper.findComponent({ ref: 'remote-button' })
    expect(remote_button.exists()).toBe(true)

    remote_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(system.page).toHaveBeenCalledWith({ remotes: true })
  })
})
