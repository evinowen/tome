import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import VMenu from '?/stubs/VMenu.vue'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import RepositoryButton from '@/components/ActionBar/RepositoryButton.vue'

describe('components/RepositoryButton', () => {
  let vuetify
  let store
  let store_dispatch

  const properties = {
    authors: 'AUTHORS.md',
    contributors: 'CONTRIBUTORS.md',
    license: 'LICENSE.md',
    readme: 'README.md',
  }

  const factory = assemble(RepositoryButton, properties)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardTitle: BasicComponentStub,
          VCardSubtitle: BasicComponentStub,
          VMenu,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {},
      actions: stub_actions([
        'files/select',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true

    expect(wrapper).toBeDefined()
  })

  it('should set value to false when select is called with a path', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true

    expect(wrapper.vm.open).toBe(true)

    const path = '/project'
    await wrapper.vm.select(path)

    expect(wrapper.vm.open).toBe(false)
  })

  it('should dispatch "files/select" action for authors file when authors button emits "click" event', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()

    const authors_button = wrapper.findComponent({ ref: 'authors-button' })
    expect(authors_button.exists()).toBe(true)

    authors_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: properties.authors })
  })

  it('should dispatch "files/select" action for contributors file when contributors button emits "click" event', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()

    const contributors_button = wrapper.findComponent({ ref: 'contributors-button' })
    expect(contributors_button.exists()).toBe(true)

    contributors_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: properties.contributors })
  })

  it('should dispatch "files/select" action for license file when license button emits "click" event', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()

    const license_button = wrapper.findComponent({ ref: 'license-button' })
    expect(license_button.exists()).toBe(true)

    license_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: properties.license })
  })

  it('should dispatch "files/select" action for readme file when readme button emits "click" event', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.open = true
    await wrapper.vm.$nextTick()

    const readme_button = wrapper.findComponent({ ref: 'readme-button' })
    expect(readme_button.exists()).toBe(true)

    readme_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: properties.readme })
  })
})
