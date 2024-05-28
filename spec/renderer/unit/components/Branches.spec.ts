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
import { StateDefaults as BranchesStateDefaults } from '@/store/modules/repository/branches'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import Branches from '@/components/Branches.vue'

describe('components/Branches', () => {
  let vuetify
  let store
  let store_dispatch
  let value

  const factory = assemble(Branches, { value })
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
            ...BranchesStateDefaults(),
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
        system: {
          ...SystemStateDefaults(),
          history: true,
        },
      },
      actions: stub_actions([
        'clipboard/text',
        'repository/branches/create',
        'repository/branches/rename',
        'repository/branches/remove',
        'repository/branches/select',
        'system/branches',
        'system/branches_remove_confirm',
        'system/patch',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    value = true
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch "system/branches" with false upon call to close', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/branches', false)
  })

  it('should dispatch "clipboard/text" with false upon call to copy', async () => {
    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.copy(name)

    expect(store_dispatch).toHaveBeenCalledWith('clipboard/text', name)
  })

  it('should set branch_create_target upon call to create_show with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_create_target).toEqual('')

    const name = 'master'

    await wrapper.vm.create_show(name)

    expect(wrapper.vm.branch_create_target).toEqual(name)
  })

  it('should dispatch "repository/branches/create" with branch name upon call to create', async () => {
    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.create(name)

    expect(store_dispatch).toHaveBeenCalledWith('repository/branches/create', name)
  })

  it('should set branch_rename_target upon call to rename_show with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_rename_target).toEqual('')

    const name = 'master'

    await wrapper.vm.rename_show(name)

    expect(wrapper.vm.branch_rename_target).toEqual(name)
  })

  it('should dispatch "repository/branches/rename" with branch name and new value upon call to rename', async () => {
    const wrapper = factory.wrap()

    const name = 'master'
    const value = 'main'

    await wrapper.vm.rename(name, value)

    expect(store_dispatch).toHaveBeenCalledWith('repository/branches/rename', { name, value })
  })

  it('should dispatch "repository/branches/select" with branch name upon call to select', async () => {
    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.select(name)

    expect(store_dispatch).toHaveBeenCalledWith('repository/branches/select', name)
  })

  it('should dispatch "system/branches_remove_confirm" with false upon call to remove_confirm with false', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.remove_confirm(false)

    expect(store_dispatch).toHaveBeenCalledWith('system/branches_remove_confirm', false)
  })

  it('should set branch_remove_target upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.branch_remove_target).toEqual('')

    const name = 'master'

    await wrapper.vm.remove_confirm(true, name)

    expect(wrapper.vm.branch_remove_target).toEqual(name)
  })

  it('should dispatch "system/branches_remove_confirm" with false upon call to remove_confirm with true', async () => {
    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.remove_confirm(true, name)

    expect(store_dispatch).toHaveBeenCalledWith('system/branches_remove_confirm', true)
  })

  it('should dispatch "repository/branches/remove" with branch name upon call to remove', async () => {
    const wrapper = factory.wrap()

    const name = 'master'

    await wrapper.vm.remove(name)

    expect(store_dispatch).toHaveBeenCalledWith('repository/branches/remove', name)
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
