import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import SystemBar from '@/components/SystemBar.vue'
import { fetch_system_store } from '@/store/modules/system'

describe('components/SystemBar', () => {
  const title = 'Test Title'

  let vuetify
  let pinia

  const factory = assemble(SystemBar, { title })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch system/settings with inverted settings value when settings is called', async () => {
    const system = fetch_system_store()

    const value = system.settings
    const wrapper = factory.wrap()

    await wrapper.vm.settings()

    expect(system.page).toHaveBeenCalledWith({ settings: !value })
  })

  it('should dispatch system/minimize when minimize is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.minimize()

    expect(system.minimize).toHaveBeenCalledWith()
  })

  it('should dispatch system/maximize when maximize is called and window is not maximized', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    expect(system.maximize).toHaveBeenCalledWith()
  })

  it('should dispatch system/restore when maximize is called and window is maximized', async () => {
    const system = fetch_system_store()

    system.maximized = true

    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    expect(system.restore).toHaveBeenCalledWith()
  })

  it('should dispatch system/exit when exit is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.exit()

    expect(system.exit).toHaveBeenCalledWith()
  })
})
