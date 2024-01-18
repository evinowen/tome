import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import VMenu from '?/stubs/VMenu.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as LibraryStateDefaults } from '@/store/modules/library'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import LibraryButton from '@/components/ActionBar/LibraryButton.vue'

describe('components/ActionBar/LibraryButton', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(LibraryButton)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
          VList: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VMenu,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        library: {
          ...LibraryStateDefaults(),
          history: [
            '/path',
          ],
        },
        repository: {
          ...RepositoryStateDefaults(),
          path: './tome_path',
        },
      },
      actions: stub_actions([
        'library/select',
        'library/open',
        'library/close',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show bookshelf button when no repository path has been identified', async () => {
    store.state.repository.path = ''

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    const bookshelf_button = wrapper.findComponent({ ref: 'bookshelf_button' })
    expect(bookshelf_button.exists()).toBe(true)

    const close_button = wrapper.findComponent({ ref: 'close_button' })
    expect(close_button.exists()).toBe(false)
  })

  it('should show close button when a repository path has been identified', async () => {
    store.state.repository.path = './tome_path'

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    const bookshelf_button = wrapper.findComponent({ ref: 'bookshelf_button' })
    expect(bookshelf_button.exists()).toBe(false)

    const close_button = wrapper.findComponent({ ref: 'close_button' })
    expect(close_button.exists()).toBe(true)
  })

  it('should dispatch library/select when select is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.select()

    expect(store_dispatch).toHaveBeenCalledWith('library/select')
  })

  it('should dispatch library/open with path when open is called with a path', async () => {
    const path = '/project'

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.open(path)

    expect(store_dispatch).toHaveBeenCalledWith('library/open', path)
  })

  it('should dispatch library/close when close is called', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('library/close')
  })
})
