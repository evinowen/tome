import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_search_store } from '@/store/modules/search'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/search', () => {
  let search

  const disk = new Disk()
  set_disk(disk)

  beforeEach(() => {
    setActivePinia(createPinia())

    disk.reset_disk()

    search = fetch_search_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set multifile flag when the multifile action is dispatched', async () => {
    expect(search.multifile).toBe(false)

    await search.flags({ multifile: true })

    expect(search.multifile).toBe(true)
  })

  it('should set regex_query flag when the regex_query action is dispatched', async () => {
    expect(search.regex_query).toBe(false)

    await search.flags({ regex_query: true })

    expect(search.regex_query).toBe(true)
  })

  it('should set case_sensitive flag when the case_sensitive action is dispatched', async () => {
    expect(search.case_sensitive).toBe(false)

    await search.flags({ case_sensitive: true })

    expect(search.case_sensitive).toBe(true)
  })

  it('should return when path is not set and execute is dispatched', async () => {
    expect(search.path).toBe('')

    await search.execute()

    expect(mocked_api.file.search_path).not.toHaveBeenCalled()
  })

  it('should return when query is not set and execute is dispatched', async () => {
    const path = '/project'

    expect(search.query).toBe('')

    await search.execute({ path, query: undefined })

    await search.flags({ multifile: true })
    await search.execute()

    expect(mocked_api.file.search_path).not.toHaveBeenCalled()
  })

  it('should set the search query when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(search.query).toBe('')

    await search.execute({ path, query })

    expect(search.query).toBe(query)
  })

  it('should not search path if multifile is false when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(search.query).toBe('')

    await search.execute({ path, query })

    expect(mocked_api.file.search_path).not.toHaveBeenCalled()
  })

  it('should search search path if multifile is false when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(search.query).toBe('')

    await search.flags({ multifile: true })
    await search.execute({ path, query })

    expect(mocked_api.file.search_path).toHaveBeenCalled()
  })

  it('should clear the search query when the clear action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(search.query).toBe('')

    await search.execute({ path, query })

    expect(search.query).toBe(query)

    await search.clear()

    expect(search.query).toBeUndefined()
  })

  it('should store results when query is set', async () => {
    const path = '/project'
    const query = 'example search'

    expect(search.query).toBe('')
    expect(search.results).toEqual([])

    await search.flags({ multifile: true })
    await search.execute({ path, query })

    expect(search.query).toBe(query)
    expect(search.results).toBeDefined()
  })

  it('should update assign navigation when the navigate action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(100)
  })

  it('should retain total when the navigate action is dispatched with only target', async () => {
    const navigation = { target: 10, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(100)

    await search.navigate({ target: 20 })

    expect(search.navigation.target).toBe(20)
    expect(search.navigation.total).toBe(100)
  })

  it('should retain target when the navigate action is dispatched with only total', async () => {
    const navigation = { target: 10, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(100)

    await search.navigate({ total: 200 })

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(200)
  })

  it('should increment navigation when the next action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(100)

    await search.next()
    expect(search.navigation.target).toBe(11)
  })

  it('should decrement navigation when the previous action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(10)
    expect(search.navigation.total).toBe(100)

    await search.previous()
    expect(search.navigation.target).toBe(9)
  })

  it('should wrap navigation when the target equals one and the next action is dispatched', async () => {
    const navigation = { target: 100, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(100)
    expect(search.navigation.total).toBe(100)

    await search.next()
    expect(search.navigation.target).toBe(1)
  })

  it('should wrap navigation when the target equals one and the previous action is dispatched', async () => {
    const navigation = { target: 1, total: 100 }

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(0)

    await search.navigate(navigation)

    expect(search.navigation.target).toBe(1)
    expect(search.navigation.total).toBe(100)

    await search.previous()
    expect(search.navigation.target).toBe(navigation.total)
  })
})
