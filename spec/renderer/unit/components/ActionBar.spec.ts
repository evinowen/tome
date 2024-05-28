import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as RepositoryBranchesStateDefaults } from '@/store/modules/repository/branches'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import ActionBar from '@/components/ActionBar.vue'

describe('components/ActionBar', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(ActionBar)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VFooter: BasicComponentStub,
          VExpandXTransition: BasicComponentStub,
          Divider: true,
          LibraryButton: BasicComponentStub,
          BranchButton: BasicComponentStub,
          ConsoleButton: BasicComponentStub,
          EditSwitch: BasicComponentStub,
          PageButton: BasicComponentStub,
          RepositoryButton: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        system: SystemStateDefaults(),
        repository: {
          ...RepositoryStateDefaults(),
          path: './tome_path',
          name: 'Name',
          branches: {
            ...RepositoryBranchesStateDefaults(),
            active: 'master',
          },
          metadata: {
            readme: undefined,
            license: undefined,
            authors: undefined,
            contributors: undefined,
          },
        },
      },
      actions: stub_actions([
        'system/open',
        'system/close',
        'system/edit',
        'system/history',
        'system/commit',
        'system/push',
        'system/search',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch system/open with path when open is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'
    await wrapper.vm.open(path)

    expect(store_dispatch).toHaveBeenCalledWith('system/open', path)
  })

  it('should close library when open is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.library = true

    expect(wrapper.vm.library).toBe(true)

    const path = './file_path'
    await wrapper.vm.open(path)

    expect(wrapper.vm.library).toBe(false)
  })

  it('should dispatch system/close when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/close')
  })

  it('should dispatch system/edit with inverse of current system edit when edit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.edit()

    expect(store_dispatch).toHaveBeenCalledWith('system/edit', true)
  })

  it('should dispatch system/history with inverse of current system branch when branch is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.history()

    expect(store_dispatch).toHaveBeenCalledWith('system/history', true)
  })

  it('should dispatch system/commit with inverse of current system commit when commit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    expect(store_dispatch).toHaveBeenCalledWith('system/commit', true)
  })

  it('should dispatch system/push with inverse of current system push when push is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.push()

    expect(store_dispatch).toHaveBeenCalledWith('system/push', true)
  })

  it('should dispatch system/search with inverse of current system search when search is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.search()

    expect(store_dispatch).toHaveBeenCalledWith('system/search', true)
  })
})
