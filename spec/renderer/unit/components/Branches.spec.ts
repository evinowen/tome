import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { Settings as LuxonSettings } from 'luxon'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Branches from '@/components/Branches.vue'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'

describe('components/Branches', () => {
  let vuetify
  let pinia
  let value

  const factory = assemble(Branches, { value })
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
          list: [
            {
              name: 'master',
              reference: 'refs/heads/master',
              updated: new Date(),
            },
          ],
        },
      },
    })

    value = true
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch "system/branches" with false upon call to close', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ branches: false })
  })

  it('should dispatch "clipboard/text" with false upon call to copy', async () => {
    const clipboard = fetch_clipboard_store()

    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.copy(name)

    expect(clipboard.text).toHaveBeenCalledWith(name)
  })

  it('should set branch_create_target upon call to create_show with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_create_target).toEqual('')

    const name = 'master'

    await wrapper.vm.create_show(name)

    expect(wrapper.vm.branch_create_target).toEqual(name)
  })

  it('should dispatch "repository/branches/create" with branch name upon call to create', async () => {
    const repository_branches = fetch_repository_branches_store()

    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.create(name)

    expect(repository_branches.create).toHaveBeenCalledWith(name)
  })

  it('should set branch_rename_target upon call to rename_show with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_rename_target).toEqual('')

    const name = 'master'

    await wrapper.vm.rename_show(name)

    expect(wrapper.vm.branch_rename_target).toEqual(name)
  })

  it('should dispatch "repository/branches/rename" with branch name and new value upon call to rename', async () => {
    const repository_branches = fetch_repository_branches_store()

    const wrapper = factory.wrap()

    const name = 'master'
    const value = 'main'

    await wrapper.vm.rename(name, value)

    expect(repository_branches.rename).toHaveBeenCalledWith({ name, value })
  })

  it('should dispatch "repository/branches/select" with branch name upon call to select', async () => {
    const repository_branches = fetch_repository_branches_store()

    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.select(name)

    expect(repository_branches.select).toHaveBeenCalledWith(name)
  })

  it('should dispatch "system/branches_remove_confirm" with false upon call to remove_confirm with false', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.remove_confirm(false)

    expect(system.page).toHaveBeenCalledWith({ branches_remove_confirm: false })
  })

  it('should set branch_remove_target upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_remove_target).toEqual('')

    const name = 'master'

    await wrapper.vm.remove_confirm(true, name)

    expect(wrapper.vm.branch_remove_target).toEqual(name)
  })

  it('should dispatch "system/branches_remove_confirm" with false upon call to remove_confirm with true', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.remove_confirm(true, name)

    expect(system.page).toHaveBeenCalledWith({ branches_remove_confirm: true })
  })

  it('should dispatch "repository/branches/remove" with branch name upon call to remove', async () => {
    const repository_branches = fetch_repository_branches_store()

    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.remove(name)

    expect(repository_branches.remove).toHaveBeenCalledWith(name)
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
