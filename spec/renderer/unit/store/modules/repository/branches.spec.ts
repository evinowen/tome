import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/branches', () => {
  let repository_branches

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_branches = fetch_repository_branches_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.branch_status upon load load dispatch', async () => {
    await repository_branches.load()

    expect(mocked_api.repository.branch_status).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.branch_create upon load create dispatch', async () => {
    const name = 'master'

    await repository_branches.create(name)

    expect(mocked_api.repository.branch_create).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_create).toHaveBeenCalledWith(name)
  })

  it('should trigger api.repository.branch_select upon load select dispatch', async () => {
    const name = 'master'

    await repository_branches.select(name)

    expect(mocked_api.repository.branch_select).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_select).toHaveBeenCalledWith(name)
  })

  it('should trigger api.repository.branch_rename upon load rename dispatch', async () => {
    const name = 'master'
    const value = 'main'

    await repository_branches.rename({ name, value })

    expect(mocked_api.repository.branch_rename).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_rename).toHaveBeenCalledWith(name, value)
  })

  it('should trigger api.repository.branch_remove upon load remove dispatch', async () => {
    const name = 'master'
    await repository_branches.remove(name)

    expect(mocked_api.repository.branch_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.branch_remove).toHaveBeenCalledWith(name)
  })
})
