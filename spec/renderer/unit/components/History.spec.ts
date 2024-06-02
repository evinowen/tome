import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { Settings as LuxonSettings } from 'luxon'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import History from '@/components/History.vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_repository_history_store } from '@/store/modules/repository/history'
import { fetch_repository_tags_store } from '@/store/modules/repository/tags'

describe('components/History', () => {
  let vuetify
  let pinia
  let value

  const factory = assemble(History, { value })
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          UtilityPage,
          VBtn: BasicComponent,
          VIcon: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'repository-branches': {
          active: 'master',
        },
        'repository-history': {
          items: [
            { oid: '1', date: new Date(), message: 'message 1', root: false },
            { oid: '2', date: new Date(), message: 'message 2', root: false },
            { oid: '3', date: new Date(), message: 'message 3', root: false },
          ],
          loaded: true,
        },
        'repository-tags': {
          list: [
            { name: 'tag-example-a', oid: '1', date: new Date() },
            { name: 'tag-example-b', oid: '2', date: new Date() },
            { name: 'tag-example-c', oid: '3', date: new Date() },
          ],
        },
        'system': {
          history: true,
        },
      },
    })

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
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ history: false })
  })

  it('should dispatch repository/history/page upon call to page', async () => {
    const repository_history = fetch_repository_history_store()

    const wrapper = factory.wrap()

    await wrapper.vm.page()

    expect(repository_history.page).toHaveBeenCalledWith()
  })

  it('should dispatch repository/history/page when history rooted flag false upon call to scroll', async () => {
    const repository_history = fetch_repository_history_store()

    const wrapper = factory.wrap()

    await wrapper.vm.scroll()

    expect(repository_history.page).toHaveBeenCalledWith()
  })

  it('should not dispatch repository/history/page when history rooted flag true upon call to scroll', async () => {
    const repository_history = fetch_repository_history_store()

    repository_history.rooted = true

    const wrapper = factory.wrap()

    await wrapper.vm.scroll()

    expect(repository_history.page).not.toHaveBeenCalledWith()
  })

  it('should call store to load commit OID into patch upon call to diff', async () => {
    const repository_comparator = fetch_repository_comparator_store()

    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(repository_comparator.diff).toHaveBeenCalledWith({ commit: 1 })
  })

  it('should dispatch "system/patch" with true upon call to diff', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.diff({ oid: 1 })

    expect(system.page).toHaveBeenCalledWith({ patch: true })
  })

  it('should dispatch "system/branches" with true upon call to branches', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.branches()

    expect(system.page).toHaveBeenCalledWith({ branches: true })
  })

  it('should dispatch "system/tags" with true upon call to tags', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.tags()

    expect(system.page).toHaveBeenCalledWith({ tags: true })
  })

  it('should dispatch "system/history_tag" with false upon call to tag_prompt with false', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.tag_prompt(false)

    expect(system.page).toHaveBeenCalledWith({ history_tag: false })
  })

  it('should not set history_tag_target upon call to tag_prompt with false', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.history_tag_target).toEqual('')

    const target = '1234'

    await wrapper.vm.tag_prompt(false, target)

    expect(wrapper.vm.history_tag_target).toEqual('')
  })

  it('should dispatch "system/history_tag" with true upon call to tag_prompt with true', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.tag_prompt(true)

    expect(system.page).toHaveBeenCalledWith({ history_tag: true })
  })

  it('should set history_tag_target upon call to tag_prompt with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.history_tag_target).toEqual('')

    const target = '1234'

    await wrapper.vm.tag_prompt(true, target)

    expect(wrapper.vm.history_tag_target).toEqual(target)
  })

  it('should dispatch "repository/tags/create" with true upon call to tag_create', async () => {
    const repository_tags = fetch_repository_tags_store()

    const wrapper = factory.wrap()

    const name = 'v1.0.0'
    const oid = '1234'

    await wrapper.vm.tag_create(name, oid)

    expect(repository_tags.create).toHaveBeenCalledWith({ name, oid })
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
