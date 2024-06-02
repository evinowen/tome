import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_search_store } from '@/store/modules/search'
import SearchService from '@/components/SearchService.vue'

describe('components/SearchService', () => {
  let vuetify
  let pinia
  const factory = assemble(SearchService)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VBtn: BasicComponent,
          VExpandTransition: BasicComponent,
          VIcon: BasicComponent,
          VItemGroup: BasicComponent,
          VLayout: BasicComponent,
          VTextField: BasicComponent,
          VToolbar: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch search/execute with query when update is called with a query', async () => {
    const search = fetch_search_store()
    const repository = fetch_repository_store()

    const wrapper = factory.wrap()

    const query = '/project'
    await wrapper.vm.update(query)

    expect(search.execute).toHaveBeenCalledWith({ path: repository.path, query })
  })

  it('should dispatch search/next when next is called', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    await wrapper.vm.next()

    expect(search.next).toHaveBeenCalledWith()
  })

  it('should dispatch search/previous when previous is called', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    await wrapper.vm.previous()

    expect(search.previous).toHaveBeenCalledWith()
  })

  it('should dispatch files/select with path when select is called with path', async () => {
    const files = fetch_files_store()

    const wrapper = factory.wrap()

    const path = '/project/file.md'
    await wrapper.vm.select(path)

    expect(files.select).toHaveBeenCalledWith({ path })
  })

  it('should dispatch search/navigate with target when select is called with a positive target', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    const path = '/project/file.md'
    const target = 1
    const total = 1
    await wrapper.vm.select(path, target, total)

    expect(search.navigate).toHaveBeenCalledWith({ target, total })
  })

  it('should dispatch "search/multifile" when multifile button emits click event', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    const value = search.case_sensitive

    const multifile_button = wrapper.findComponent({ ref: 'multifile-button' })
    expect(multifile_button.exists()).toBe(true)

    await multifile_button.vm.$emit('click', !value)

    expect(search.flags).toHaveBeenCalledWith({ multifile: !value })
  })

  it('should dispatch "search/case_sensitive" when case sensitive button emits click event', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    const value = search.case_sensitive

    const case_sensitive_button = wrapper.findComponent({ ref: 'case-sensitive-button' })
    expect(case_sensitive_button.exists()).toBe(true)

    await case_sensitive_button.vm.$emit('click', !value)

    expect(search.flags).toHaveBeenCalledWith({ case_sensitive: !value })
  })

  it('should dispatch "search/regex_query" when regex query button emits click event', async () => {
    const search = fetch_search_store()

    const wrapper = factory.wrap()

    const value = search.case_sensitive

    const regex_query_button = wrapper.findComponent({ ref: 'regex-query-button' })
    expect(regex_query_button.exists()).toBe(true)

    await regex_query_button.vm.$emit('click', !value)

    expect(search.flags).toHaveBeenCalledWith({ regex_query: !value })
  })
})
