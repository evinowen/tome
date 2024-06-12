import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_tags_store } from '@/store/modules/repository/tags'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/branches', () => {
  let repository_tags

  beforeEach(() => {
    setActivePinia(createPinia())
    repository_tags = fetch_repository_tags_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.tag_list upon load dispatch', async () => {
    await repository_tags.load()

    expect(mocked_api.repository.tag_list).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.tag_create upon create dispatch', async () => {
    const name = 'v1.0.0'
    const oid = '1234'

    await repository_tags.create({ name, oid })

    expect(mocked_api.repository.tag_create).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.tag_create).toHaveBeenCalledWith(name, oid)
  })

  it('should trigger api.repository.tag_remove upon remove dispatch', async () => {
    const name = 'v1.0.0'
    await repository_tags.remove(name)

    expect(mocked_api.repository.tag_remove).toHaveBeenCalledTimes(1)
    expect(mocked_api.repository.tag_remove).toHaveBeenCalledWith(name)
  })
})
