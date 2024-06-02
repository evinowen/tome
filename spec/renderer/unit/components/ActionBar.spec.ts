import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ActionBar from '@/components/ActionBar.vue'
import { fetch_system_store } from '@/store/modules/system'

describe('components/ActionBar', () => {
  let vuetify
  let pinia

  const factory = assemble(ActionBar)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'repository': {
          path: './tome_path',
          name: 'Name',
        },
        'repository-branches': {
          active: 'master',
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch system/edit with inverse of current system edit when edit is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.edit()

    expect(system.page).toHaveBeenCalledWith({ edit: true })
  })

  it('should dispatch system/history with inverse of current system branch when branch is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.history()

    expect(system.page).toHaveBeenCalledWith({ history: true })
  })

  it('should dispatch system/commit with inverse of current system commit when commit is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    expect(system.page).toHaveBeenCalledWith({ commit: true })
  })

  it('should dispatch system/push with inverse of current system push when push is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.push()

    expect(system.page).toHaveBeenCalledWith({ push: true })
  })

  it('should dispatch system/search with inverse of current system search when search is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.search()

    expect(system.page).toHaveBeenCalledWith({ search: true })
  })
})
