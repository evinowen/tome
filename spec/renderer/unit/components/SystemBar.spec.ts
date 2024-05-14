import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import SystemBar from '@/components/SystemBar.vue'

describe('components/SystemBar', () => {
  const title = 'Test Title'

  let vuetify
  let store
  let store_dispatch

  const factory = assemble(SystemBar, { title })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
          VSpacer: BasicComponentStub,
          VSystemBar: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'system/exit',
        'system/maximize',
        'system/minimize',
        'system/restore',
        'system/settings',
        'system/theme_editor',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch system/settings with inverted settings value when settings is called', async () => {
    const value = store.state.system.settings
    const wrapper = factory.wrap()

    await wrapper.vm.settings()

    expect(store_dispatch).toHaveBeenCalledWith('system/settings', !value)
  })

  it('should dispatch system/minimize when minimize is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.minimize()

    expect(store_dispatch).toHaveBeenCalledWith('system/minimize')
  })

  it('should dispatch system/maximize when maximize is called and window is not maximized', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    expect(store_dispatch).toHaveBeenCalledWith('system/maximize')
  })

  it('should dispatch system/restore when maximize is called and window is maximized', async () => {
    store.state.system.maximized = true

    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    expect(store_dispatch).toHaveBeenCalledWith('system/restore')
  })

  it('should dispatch system/exit when exit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.exit()

    expect(store_dispatch).toHaveBeenCalledWith('system/exit')
  })
})
