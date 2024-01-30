import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { CredentialStateDefaults as RepositoryCredentialStateDefaults } from '@/store/modules/repository'
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
          StatusButton: BasicComponentStub,
          PushBranch: BasicComponentStub,
          PushConfirm: BasicComponentStub,
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
          name: 'Name',
          branch: 'master',
        },
        system: {
          ...SystemStateDefaults(),
          push: true,
          push_confirm: false,
        },
      },
      actions: stub_actions([
        'repository/create-remote',
        'repository/diff',
        'repository/remote',
        'system/patch',
        'system/perform',
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

    expect(store_dispatch).toHaveBeenCalledWith('repository/diff', { commit: 1 })
  })

  it('should dispatch system/perform for push when push is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.push()

    expect(store_dispatch).toHaveBeenCalledWith('system/perform', 'push')
  })

  it('should dispatch repository/remote with name when select_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const remote = 'origin'

    await wrapper.vm.select_remote(remote)

    expect(store_dispatch).toHaveBeenCalledWith('repository/remote', remote)
  })

  it('should call store to create remote when add_remote is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const name = 'new'
    const url = 'git@git.example.com:remote.git'

    await wrapper.vm.add_remote(name, url)

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toEqual('repository/create-remote')
    expect(store_dispatch.mock.calls[0][1]).toEqual({ name, url })
  })
})
