import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as RepositoryBranchesStateDefaults } from '@/store/modules/repository/branches'
import { StateDefaults as RepositoryCredentialStateDefaults } from '@/store/modules/repository/credentials'
import { StateDefaults as RepositoryRemotesStateDefaults } from '@/store/modules/repository/remotes'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import Push from '@/components/Push.vue'

describe('components/Push', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(Push)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
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

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
        repository: {
          ...RepositoryStateDefaults(),
          credentials: RepositoryCredentialStateDefaults(),
          remotes: RepositoryRemotesStateDefaults(),
          name: 'Name',
          branches: {
            ...RepositoryBranchesStateDefaults(),
            active: 'master',
          },
        },
        system: {
          ...SystemStateDefaults(),
          push: true,
          push_confirm: false,
        },
      },
      actions: stub_actions([
        'repository/remotes/add',
        'repository/comparator/diff',
        'repository/remote',
        'system/patch',
        'system/perform',
        'system/push',
        'system/push_confirm',
        'system/remotes',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.diff({ oid: 1 })

    expect(store_dispatch).toHaveBeenCalledWith('repository/comparator/diff', { commit: 1 })
  })

  it('should dispatch "system/push" upon call to close method', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/push', false)
  })

  it('should dispatch "system/push_confirm" upon call to confirm method', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.confirm(false)

    expect(store_dispatch).toHaveBeenCalledWith('system/push_confirm', false)
  })

  it('should dispatch "system/perform" upon call to push method', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.push()

    expect(store_dispatch).toHaveBeenCalledWith('system/perform', 'push')
  })

  it('should dispatch "system/remotes" upon call to remotes method', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.remotes()

    expect(store_dispatch).toHaveBeenCalledWith('system/remotes', true)
  })

  it('should dispatch "repository/remote" with name upon call to select_remote method', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = 'origin'

    await wrapper.vm.select_remote(remote)

    expect(store_dispatch).toHaveBeenCalledWith('repository/remote', remote)
  })
})
