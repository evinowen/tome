import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { build_store } from '@/store'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/repository')
vi.mock('@/store/modules/configuration')
vi.mock('@/store/modules/library')
vi.mock('@/store/modules/files')
vi.mock('@/store/modules/templates')
vi.mock('@/store/modules/actions')
vi.mock('@/store/modules/configuration')
vi.mock('@/store/modules/clipboard')
vi.mock('@/store/modules/search')
vi.mock('@/store/modules/system')
vi.mock('@/store/plugins/mediator')

const mocked_api = builders.api()
// eslint-disable-next-line no-import-assign
Object.assign(api_module, { default: mocked_api })

describe('store', () => {
  let store

  beforeEach(() => {
    vi.resetModules()
    store = build_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', () => {
    expect(store.state.application_path).toBe('')
    expect(store.state.configuration_path).toBe('')
    expect(store.state.library_path).toBe('')
  })

  it('should perform initial state setup on dispatch of hydrate action', async () => {
    await store.dispatch('hydrate')
  })

  it('should store message event on dispatch of error action', async () => {
    expect(store.state.events).toHaveLength(0)

    await store.dispatch('message', 'Message!')

    expect(store.state.events).toHaveLength(1)
  })

  it('should store error event on dispatch of error action with string', async () => {
    expect(store.state.events).toHaveLength(0)

    await store.dispatch('error', 'Error!')

    expect(store.state.events).toHaveLength(1)
  })

  it('should store error event on dispatch of error action with Error object', async () => {
    expect(store.state.events).toHaveLength(0)

    await store.dispatch('error', new Error('Error!'))

    expect(store.state.events).toHaveLength(1)
  })
})
