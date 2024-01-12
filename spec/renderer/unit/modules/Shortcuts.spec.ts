import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { stub_actions } from '?/builders/store'
import { createStore } from 'vuex'
import { State } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'

describe('modules/OperateShortcuts', () => {
  let store
  let store_dispatch

  beforeEach(() => {
    store = createStore<State>({
      state: {
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'library/select',
        'system/commit',
        'system/edit',
        'system/perform',
        'system/settings',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const ShortcutOperator = operate_shortcuts(store)

    expect(ShortcutOperator).toBeDefined()
  })

  it('should dispatch system/settings with true when escape is called and no flags are set', async () => {
    const ShortcutOperator = operate_shortcuts(store)

    await ShortcutOperator.escape()

    expect(store_dispatch).toHaveBeenCalledWith('system/settings', true)
  })

  it('should dispatch system flag for layer name with false when escape is called and layer flag is set', async () => {
    store.state.system.edit = true

    const ShortcutOperator = operate_shortcuts(store)

    await ShortcutOperator.escape()

    expect(store_dispatch).toHaveBeenCalledWith('system/edit', false)
  })

  it('should dispatch system flag for layer name with inverse value when layer is called with a layer name', async () => {
    const value = store.state.system.commit
    const ShortcutOperator = operate_shortcuts(store)

    const layer = 'commit'
    await ShortcutOperator.layer(layer)

    expect(store_dispatch).toHaveBeenCalledWith('system/commit', !value)
  })

  it('should dispatch system/perform with perform name when perform is called with a name', async () => {
    const ShortcutOperator = operate_shortcuts(store)

    const performance = 'example-performance'
    await ShortcutOperator.perform(performance)

    expect(store_dispatch).toHaveBeenCalledWith('system/perform', performance)
  })

  it('should dispatch specified action when dispatch is called', async () => {
    const ShortcutOperator = operate_shortcuts(store)

    const dispatch = 'libary/select'

    await ShortcutOperator.dispatch(dispatch)

    expect(store_dispatch).toHaveBeenCalledWith(dispatch)
  })
})
