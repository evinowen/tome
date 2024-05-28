import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { stub_actions } from '?/builders/store'
import { Settings as LuxonSettings } from 'luxon'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as RepositoryBranchesStateDefaults } from '@/store/modules/repository/branches'
import { StateDefaults as HistoryStateDefaults } from '@/store/modules/repository/history'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import History from '@/components/History.vue'

describe('components/History', () => {
  let vuetify
  let store
  let store_dispatch
  let value

  const factory = assemble(History, { value })
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          UtilityPage,
          VBtn: BasicComponent,
          VIcon: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        repository: {
          ...RepositoryStateDefaults(),
          branches: {
            ...RepositoryBranchesStateDefaults(),
            active: 'master',
          },
          history: {
            ...HistoryStateDefaults(),
            items: [
              { oid: '1', date: new Date(), message: 'message 1', root: false },
              { oid: '2', date: new Date(), message: 'message 2', root: false },
              { oid: '3', date: new Date(), message: 'message 3', root: false },
            ],
            loaded: true,
          },
        },
        system: {
          ...SystemStateDefaults(),
          history: true,
        },
      },
      actions: stub_actions([
        'repository/comparator/diff',
        'repository/history/page',
        'system/history',
        'system/patch',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    value = true
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should clear ticker timeout when component is unmounted', async () => {
    vi.useFakeTimers()
    const mocked_clearTimeout = vi.spyOn(global, 'clearTimeout')

    const wrapper = factory.wrap()
    wrapper.unmount()

    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.ticker)
  })

  it('should dispatch system/history with false upon call to close', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/history', false)
  })

  it('should dispatch repository/history/page upon call to page', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.page()

    expect(store_dispatch).toHaveBeenCalledWith('repository/history/page')
  })

  it('should dispatch repository/history/page when history rooted flag false upon call to scroll', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.scroll()

    expect(store_dispatch).toHaveBeenCalledWith('repository/history/page')
  })

  it('should not dispatch repository/history/page when history rooted flag true upon call to scroll', async () => {
    store.state.repository.history.rooted = true

    const wrapper = factory.wrap()

    await wrapper.vm.scroll()

    expect(store_dispatch).not.toHaveBeenCalledWith('repository/history/page')
  })

  it('should call store to load commit OID into patch upon call to diff', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(store_dispatch).toHaveBeenCalledWith('repository/comparator/diff', { commit: 1 })
  })

  it('should dispatch system/patch with true upon call to diff', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(store_dispatch).toHaveBeenCalledWith('system/patch', true)
  })

  it('should format date string upon call to format_date', async () => {
    const wrapper = factory.wrap()

    LuxonSettings.defaultZone = 'UTC'

    const date = new Date('2000-01-01T12:00:00Z')

    const result = wrapper.vm.format_date(date)

    expect(result).toEqual('1/1/2000 12:00:00 UTC')
  })

  it('should format date string upon call to format_date_relative', async () => {
    const wrapper = factory.wrap()

    const date_now = new Date(Date.now())
    const date = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate() - 1, date_now.getHours(), date_now.getMinutes(), date_now.getSeconds())

    const result = wrapper.vm.format_date_relative(date)

    expect(result).toEqual('1 day ago')
  })
})
