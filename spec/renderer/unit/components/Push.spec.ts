import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { createVuetify } from 'vuetify'
import { fetch_system_store } from '@/store/modules/system'
import Push from '@/components/Push.vue'

describe('components/Push', () => {
  let vuetify
  let pinia

  const factory = assemble(Push)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          UtilityPage,
          CredentialSelector: BasicComponentStub,
          StatusButton: BasicComponentStub,
          PushBranch: BasicComponentStub,
          PushRemoteSelector: BasicComponentStub,
          PushConfirm: BasicComponentStub,
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
          VCol: BasicComponentStub,
          VCard: BasicComponentStub,
          VContainer: BasicComponentStub,
          VRow: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'repository': {
          name: 'Name',
        },
        'repository-branches': {
          active: 'master',
        },
        'system': {
          push: true,
          push_confirm: false,
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should call system.page with push flag set false upon call to close method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ push: false })
  })

  it('should dispatch system.page with push_confirm flag set true upon call to confirm method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm()

    expect(system.page).toHaveBeenCalledWith({ push_confirm: true })
  })

  it('should dispatch system.page with remotes flag set true upon call to remotes method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.remotes()

    expect(system.page).toHaveBeenCalledWith({ remotes: true })
  })
})
