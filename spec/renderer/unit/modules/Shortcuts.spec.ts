import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'
import { fetch_system_store } from '@/store/modules/system'

describe('modules/Shortcuts', () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const ShortcutOperator = operate_shortcuts()

    expect(ShortcutOperator).toBeDefined()
  })

  it('should dispatch system/settings with true when escape is called and no flags are set', async () => {
    const system = fetch_system_store()

    const ShortcutOperator = operate_shortcuts()

    await ShortcutOperator.escape()

    expect(system.page).toHaveBeenCalledWith({ settings: true })
  })

  it('should dispatch system flag for layer name with false when escape is called and layer flag is set', async () => {
    const system = fetch_system_store()
    system.edit = true

    const ShortcutOperator = operate_shortcuts()

    await ShortcutOperator.escape()

    expect(system.page).toHaveBeenCalledWith({ edit: false })
  })

  it('should dispatch system flag for layer name with inverse value when layer is called with a layer name', async () => {
    const system = fetch_system_store()

    const value = system.commit
    const ShortcutOperator = operate_shortcuts()

    const layer = 'commit'
    await ShortcutOperator.layer(layer)

    expect(system.page).toHaveBeenCalledWith({ commit: !value })
  })

  it('should dispatch system/perform with perform name when perform is called with a name', async () => {
    const system = fetch_system_store()

    const ShortcutOperator = operate_shortcuts()

    const performance = 'example-performance'
    await ShortcutOperator.perform(performance)

    expect(system.perform).toHaveBeenCalledWith(performance)
  })
})
