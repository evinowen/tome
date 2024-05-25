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
import { StateDefaults as RepositoryRemotesStateDefaults } from '@/store/modules/repository/remotes'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import Remotes, { RemoteUrlPlaceholderInterval, RemoteUrlPlaceholderValues } from '@/components/Remotes.vue'

vi.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

describe('components/Remotes', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(Remotes)
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          UtilityPage,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCol: BasicComponentStub,
          VDivider: BasicComponentStub,
          VIcon: BasicComponentStub,
          VList: BasicComponentStub,
          VListItem: BasicComponentStub,
          VRow: BasicComponentStub,
          VSheet: BasicComponentStub,
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
          remotes: RepositoryRemotesStateDefaults(),
        },
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'system/remotes',
        'repository/remotes/add',
        'repository/remotes/remove',
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

  it('should dispatch "system/remotes" when page emits close', async () => {
    const wrapper = factory.wrap()

    const page = wrapper.findComponent({ ref: 'page' })
    expect(page.exists()).toBe(true)

    page.vm.$emit('close')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('system/remotes', false)
  })

  it('should set initial remote_url_placeholder on mount', async () => {
    vi.useFakeTimers()
    const wrapper = factory.wrap()
    expect(wrapper.vm.remote_url_placeholder).toEqual(RemoteUrlPlaceholderValues.Http)
  })

  it('should set next remote_url_placeholder message after RemoteUrlPlaceholderInterval timeout', async () => {
    vi.useFakeTimers()
    const wrapper = factory.wrap()

    vi.advanceTimersByTime(RemoteUrlPlaceholderInterval)
    expect(wrapper.vm.remote_url_placeholder).toEqual(RemoteUrlPlaceholderValues.Git)
  })

  it('should set next remote_url_placeholder message after 2x RemoteUrlPlaceholderInterval timeout', async () => {
    vi.useFakeTimers()
    const wrapper = factory.wrap()

    vi.advanceTimersByTime(RemoteUrlPlaceholderInterval)
    vi.advanceTimersByTime(RemoteUrlPlaceholderInterval)

    expect(wrapper.vm.remote_url_placeholder).toEqual(RemoteUrlPlaceholderValues.Http)
  })

  it('should clear timeout for remote_url_placeholder when unmounted', async () => {
    vi.useFakeTimers()
    const mocked_clearTimeout = vi.spyOn(global, 'clearTimeout')

    const wrapper = factory.wrap()
    wrapper.unmount()

    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.ticker)
  })

  it('should set remote_command_error upon call to add_command when a no command is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_command = ''
    wrapper.vm.remote_command_error = false

    await wrapper.vm.add_command()

    expect(wrapper.vm.remote_command_error).toEqual(true)
  })

  it('should set remote_command_error upon call to add_command when an invalid command is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_command = 'invalid command'
    wrapper.vm.remote_command_error = false

    await wrapper.vm.add_command()

    expect(wrapper.vm.remote_command_error).toEqual(true)
  })

  it('should set remote_command_error upon call to add_command when an invalid command url is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_command = 'git remote add invalid command'
    wrapper.vm.remote_command_error = false

    await wrapper.vm.add_command()

    expect(wrapper.vm.remote_command_error).toEqual(true)
  })

  it('should clear remote_command_error upon call to add_command when a valid command is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_command = 'git remote add origin git@127.0.0.1:username/example.git'
    wrapper.vm.remote_command_error = true

    await wrapper.vm.add_command()

    expect(wrapper.vm.remote_command_error).toEqual(false)
  })

  it('should dispatch "repository/remotes/add" upon call to add_command when a valid command is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_command = 'git remote add origin git@127.0.0.1:username/example.git'
    wrapper.vm.remote_command_error = true

    await wrapper.vm.add_command()

    expect(store_dispatch).toHaveBeenCalledWith('repository/remotes/add', {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
    })
  })

  it('should clear remote_name_error upon call to add_manual when a valid name is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_name = 'origin'
    wrapper.vm.remote_name_error = true

    await wrapper.vm.add_manual()

    expect(wrapper.vm.remote_name_error).toEqual(false)
  })

  it('should clear remote_url_error upon call to add_manual when a valid url is set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_url = 'git@127.0.0.1:username/example.git'
    wrapper.vm.remote_url_error = true

    await wrapper.vm.add_manual()

    expect(wrapper.vm.remote_url_error).toEqual(false)
  })

  it('should dispatch "repository/remotes/add" upon call to add_manual when a valid name and url are set', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_name = 'origin'
    wrapper.vm.remote_name_error = true
    wrapper.vm.remote_url = 'git@127.0.0.1:username/example.git'
    wrapper.vm.remote_url_error = true

    await wrapper.vm.add_manual()

    expect(store_dispatch).toHaveBeenCalledWith('repository/remotes/add', {
      name: 'origin',
      url: 'git@127.0.0.1:username/example.git',
    })
  })

  it('should set remote_remove_name to provided remote name upon call to remove_confirm method', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_remove_name = 'fake'
    wrapper.vm.remote_remove_confirm = false

    await wrapper.vm.remove_confirm('origin')

    expect(wrapper.vm.remote_remove_name).toEqual('origin')
  })

  it('should set remote_remove_confirm to true upon call to remove_confirm method', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_remove_name = 'fake'
    wrapper.vm.remote_remove_confirm = false

    await wrapper.vm.remove_confirm('origin')

    expect(wrapper.vm.remote_remove_confirm).toEqual(true)
  })

  it('should clear remote_remove_confirm upon call to remove method', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_remove_name = 'origin'
    wrapper.vm.remote_remove_confirm = true

    await wrapper.vm.remove()

    expect(wrapper.vm.remote_remove_confirm).toEqual(false)
  })

  it('should dispatch "repository/remotes/remove" with remote_remove_name upon call to remove method', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.remote_remove_name = 'origin'
    wrapper.vm.remote_remove_confirm = true

    await wrapper.vm.remove()

    expect(store_dispatch).toHaveBeenCalledWith('repository/remotes/remove', { name: 'origin' })
  })
})
