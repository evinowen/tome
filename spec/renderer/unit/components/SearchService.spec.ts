import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import BasicComponent from '?/stubs/BasicComponent.vue'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as SearchStateDefaults } from '@/store/modules/search'
import SearchService from '@/components/SearchService.vue'

describe('components/SearchService', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(SearchService)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
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

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
        repository: RepositoryStateDefaults(),
        search: SearchStateDefaults(),
      },
      actions: stub_actions([
        'files/select',
        'search/navigate',
        'search/next',
        'search/previous',
        'search/query',
        'search/multifile',
        'search/case_sensitive',
        'search/regex_query',
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

  it('should dispatch search/query with query when update is called with a query', async () => {
    const wrapper = factory.wrap()

    const query = '/project'
    await wrapper.vm.update(query)

    expect(store_dispatch).toHaveBeenCalledWith('search/query', { path: store.state.repository.path, query })
  })

  it('should dispatch search/next when next is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.next()

    expect(store_dispatch).toHaveBeenCalledWith('search/next')
  })

  it('should dispatch search/previous when previous is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.previous()

    expect(store_dispatch).toHaveBeenCalledWith('search/previous')
  })

  it('should dispatch files/select with path when select is called with path', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    await wrapper.vm.select(path)

    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path })
  })

  it('should dispatch search/navigate with target when select is called with a positive target', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    const target = 1
    const total = 1
    await wrapper.vm.select(path, target, total)

    expect(store_dispatch).toHaveBeenCalledWith('search/navigate', { target, total })
  })

  it('should dispatch "search/multifile" when multifile button emits click event', async () => {
    const wrapper = factory.wrap()

    const value = store.state.search.case_sensitive

    const multifile_button = wrapper.findComponent({ ref: 'multifile-button' })
    expect(multifile_button.exists()).toBe(true)

    await multifile_button.vm.$emit('click', !value)

    expect(store.dispatch).toHaveBeenCalledWith('search/multifile', !value)
  })

  it('should dispatch "search/case_sensitive" when case sensitive button emits click event', async () => {
    const wrapper = factory.wrap()

    const value = store.state.search.case_sensitive

    const case_sensitive_button = wrapper.findComponent({ ref: 'case-sensitive-button' })
    expect(case_sensitive_button.exists()).toBe(true)

    await case_sensitive_button.vm.$emit('click', !value)

    expect(store.dispatch).toHaveBeenCalledWith('search/case_sensitive', !value)
  })

  it('should dispatch "search/regex_query" when regex query button emits click event', async () => {
    const wrapper = factory.wrap()

    const value = store.state.search.case_sensitive

    const regex_query_button = wrapper.findComponent({ ref: 'regex-query-button' })
    expect(regex_query_button.exists()).toBe(true)

    await regex_query_button.vm.$emit('click', !value)

    expect(store.dispatch).toHaveBeenCalledWith('search/regex_query', !value)
  })
})
