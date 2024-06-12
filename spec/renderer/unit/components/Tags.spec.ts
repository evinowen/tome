import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { Settings as LuxonSettings } from 'luxon'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Tags from '@/components/Tags.vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_repository_tags_store } from '@/store/modules/repository/tags'

describe('components/Branches', () => {
  let vuetify
  let pinia
  const factory = assemble(Tags)
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
        'repository-tags': {
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
        'system': {
          history: true,
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch "system/tags" with false upon call to close', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ tags: false })
  })

  it('should dispatch "repository/comparator/diff" with commit oid upon call to diff', async () => {
    const repository_comparator = fetch_repository_comparator_store()

    const wrapper = factory.wrap()

    const oid = '123'

    await wrapper.vm.diff(oid)

    expect(repository_comparator.diff).toHaveBeenCalledWith({ commit: oid })
  })

  it('should dispatch "system/patch" with true upon call to diff', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const oid = '123'

    await wrapper.vm.diff(oid)

    expect(system.page).toHaveBeenCalledWith({ patch: true })
  })

  it('should dispatch "system/tags_remove_confirm" with false upon call to remove_confirm with false', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.remove_confirm(false)

    expect(system.page).toHaveBeenCalledWith({ tags_remove_confirm: false })
  })

  it('should set tag_remove_target upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.tag_remove_target).toEqual('')

    const name = 'v1.0.0'

    await wrapper.vm.remove_confirm(true, name)

    expect(wrapper.vm.tag_remove_target).toEqual(name)
  })

  it('should dispatch "system/tags_remove_confirm" with false upon call to remove_confirm with true', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const name = 'v1.0.0'

    await wrapper.vm.remove_confirm(true, name)

    expect(system.page).toHaveBeenCalledWith({ tags_remove_confirm: true })
  })

  it('should dispatch "repository/tags/remove" with branch name upon call to remove', async () => {
    const repository_tags = fetch_repository_tags_store()

    const wrapper = factory.wrap()

    const name = 'v1.0.0'

    await wrapper.vm.remove(name)

    expect(repository_tags.remove).toHaveBeenCalledWith(name)
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
