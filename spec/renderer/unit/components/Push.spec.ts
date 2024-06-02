import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Push from '@/components/Push.vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'

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

  it('should call store to load commit OID into patch when diff is called', async () => {
    const repository_comparator = fetch_repository_comparator_store()

    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(repository_comparator.diff).toHaveBeenCalledWith({ commit: 1 })
  })

  it('should dispatch "system/push" upon call to close method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ push: false })
  })

  it('should dispatch "system/push_confirm" upon call to confirm method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm(false)

    expect(system.page).toHaveBeenCalledWith({ push_confirm: false })
  })

  it('should dispatch "system/perform" upon call to push method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.push()

    expect(system.perform).toHaveBeenCalledWith('push')
  })

  it('should dispatch "system/remotes" upon call to remotes method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.remotes()

    expect(system.page).toHaveBeenCalledWith({ remotes: true })
  })

  it('should dispatch "repository/remote" with name upon call to select_remote method', async () => {
    const repository_remotes = fetch_repository_remotes_store()

    const wrapper = factory.wrap()

    const remote = 'origin'

    await wrapper.vm.select_remote(remote)

    expect(repository_remotes.select).toHaveBeenCalledWith(remote)
  })
})
