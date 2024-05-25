import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import VDataTable from '?/stubs/VDataTable.vue'
import { stub_actions } from '?/builders/store'
import { Settings as LuxonSettings } from 'luxon'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import Branch from '@/components/Branch.vue'

describe('components/Branch', () => {
  let vuetify
  let store
  let store_dispatch
  let value

  const factory = assemble(Branch, { value })
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VDataTable,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        repository: {
          ...RepositoryStateDefaults(),
          history: [
            { oid: '1', date: new Date(), message: 'message 1' },
            { oid: '2', date: new Date(), message: 'message 2' },
            { oid: '3', date: new Date(), message: 'message 3' },
          ],
        },
        system: {
          ...SystemStateDefaults(),
          branch: true,
        },
      },
      actions: stub_actions([
        'repository/comparator/diff',
        'system/branch',
        'system/patch',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    value = true
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch system/branch with false when close is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/branch', false)
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.diff({ oid: 1 })

    expect(store_dispatch).toHaveBeenCalledWith('repository/comparator/diff', { commit: 1 })
  })

  it('should dispatch system/patch with true when diff is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(store_dispatch).toHaveBeenCalledWith('system/patch', true)
  })

  it('should format date string on call to format_date', async () => {
    const wrapper = factory.wrap()

    LuxonSettings.defaultZone = 'UTC'

    const date = new Date('2000-01-01T12:00:00Z')

    const result = wrapper.vm.format_date(date)

    expect(result).toEqual('1/1/2000 12:00:00 UTC')
  })

  it('should format date string on call to format_date_relative', async () => {
    const wrapper = factory.wrap()

    const date_now = new Date(Date.now())
    const date = new Date(date_now.getFullYear(), date_now.getMonth(), date_now.getDate() - 1, date_now.getHours(), date_now.getMinutes(), date_now.getSeconds())

    const result = wrapper.vm.format_date_relative(date)

    expect(result).toEqual('1 day ago')
  })
})
