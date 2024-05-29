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
import { StateDefaults as TagsStateDefaults } from '@/store/modules/repository/tags'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import Tags from '@/components/Tags.vue'

describe('components/Branches', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(Tags)
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
          tags: {
            ...TagsStateDefaults(),
            list: [
              {
                name: 'v1.0.0',
                oid: '123',
                date: new Date(),
              },
              {
                name: 'v2.0.0',
                oid: '456',
                date: new Date(),
              },
              {
                name: 'v3.0.0',
                oid: '789',
                date: new Date(),
              },
            ],
          },
        },
        system: {
          ...SystemStateDefaults(),
          history: true,
        },
      },
      actions: stub_actions([
        'repository/tags/list',
        'repository/tags/remove',
        'system/tags',
        'system/tags_remove_confirm',
        'system/patch',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch "system/tags" with false upon call to close', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/tags', false)
  })

  it('should dispatch "repository/comparator/diff" with commit oid upon call to diff', async () => {
    const wrapper = factory.wrap()

    const oid = '123'

    await wrapper.vm.diff(oid)

    expect(store_dispatch).toHaveBeenCalledWith('repository/comparator/diff', { commit: oid })
  })

  it('should dispatch "system/patch" with true upon call to diff', async () => {
    const wrapper = factory.wrap()

    const oid = '123'

    await wrapper.vm.diff(oid)

    expect(store_dispatch).toHaveBeenCalledWith('system/patch', true)
  })

  it('should dispatch "system/tags_remove_confirm" with false upon call to remove_confirm with false', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.remove_confirm(false)

    expect(store_dispatch).toHaveBeenCalledWith('system/tags_remove_confirm', false)
  })

  it('should set tag_remove_target upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.tag_remove_target).toEqual('')

    const name = 'v1.0.0'

    await wrapper.vm.remove_confirm(true, name)

    expect(wrapper.vm.tag_remove_target).toEqual(name)
  })

  it('should dispatch "system/tags_remove_confirm" with false upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    const name = 'v1.0.0'

    await wrapper.vm.remove_confirm(true, name)

    expect(store_dispatch).toHaveBeenCalledWith('system/tags_remove_confirm', true)
  })

  it('should dispatch "repository/tags/remove" with branch name upon call to remove', async () => {
    const wrapper = factory.wrap()

    const name = 'v1.0.0'

    await wrapper.vm.remove(name)

    expect(store_dispatch).toHaveBeenCalledWith('repository/tags/remove', name)
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
