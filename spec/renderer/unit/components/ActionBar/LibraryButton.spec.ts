import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import VMenu from '?/stubs/VMenu.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import LibraryButton from '@/components/ActionBar/LibraryButton.vue'
import { fetch_library_store } from '@/store/modules/library'
import { fetch_repository_store } from '@/store/modules/repository'

describe('components/ActionBar/LibraryButton', () => {
  let vuetify
  let pinia

  const factory = assemble(LibraryButton)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'library': {
          history: [
            '/path',
          ],
        },
        'repository': {
          path: './tome_path',
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should show bookshelf button when no repository path has been identified', async () => {
    const repository = fetch_repository_store()
    repository.path = ''

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    const bookshelf_button = wrapper.findComponent({ ref: 'bookshelf-button' })
    expect(bookshelf_button.exists()).toBe(true)

    const close_button = wrapper.findComponent({ ref: 'close-button' })
    expect(close_button.exists()).toBe(false)
  })

  it('should show close button when a repository path has been identified', async () => {
    const repository = fetch_repository_store()
    repository.path = './tome_path'

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    const bookshelf_button = wrapper.findComponent({ ref: 'bookshelf-button' })
    expect(bookshelf_button.exists()).toBe(false)

    const close_button = wrapper.findComponent({ ref: 'close-button' })
    expect(close_button.exists()).toBe(true)
  })

  it('should dispatch library/select when select is called', async () => {
    const library = fetch_library_store()

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.select()

    expect(library.select).toHaveBeenCalledWith()
  })

  it('should dispatch library/open with path when open is called with a path', async () => {
    const library = fetch_library_store()

    const path = '/project'

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.open(path)

    expect(library.open).toHaveBeenCalledWith(path)
  })

  it('should dispatch library/close when close is called', async () => {
    const library = fetch_library_store()

    const wrapper = factory.wrap()
    wrapper.vm.show = true
    await wrapper.vm.$nextTick()

    await wrapper.vm.close()

    expect(library.close).toHaveBeenCalledWith()
  })
})
