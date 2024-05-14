import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as ApplicationStateDefaults } from '@/store/modules/configuration/themes/sections/application'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'

import App from '@/components/App.vue'

describe('components/App', () => {
  let vuetify
  let store

  const factory = assemble(App)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VApp: true,
          VMain: true,
          SystemBar: true,
          Settings: true,
          Branch: true,
          Patch: true,
          Commit: true,
          Push: true,
          Console: true,
          EditorInterface: true,
          EmptyPane: true,
          ActionBar: true,
          ContextMenuService: true,
          SearchService: true,
          ShortcutService: true,
        },
      },
    }))

  beforeEach(() => {
    store = createStore<State>({
      state: {
        configuration: {
          ...ConfigurationStateDefaults(),
          themes: {
            dark: {},
            light: {
              application: ApplicationStateDefaults(),
            },
          },
        },
        repository: {
          ...RepositoryStateDefaults(),
          loaded: false,
          path: '',
        },
        system: SystemStateDefaults(),
      },
      actions: {
        'present': vi.fn(),
      },
    })

    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should reset the scroll for element included as event for scroll method', async () => {
    const event = {
      target: { scrollTop: 100 },
    }

    expect(event.target.scrollTop).not.toBe(0)

    const wrapper = factory.wrap()

    wrapper.vm.scroll(event)

    expect(event.target.scrollTop).toBe(0)
  })
})
