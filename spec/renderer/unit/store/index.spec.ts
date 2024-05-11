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

  it('should store event on dispatch of log action', async () => {
    expect(store.state.events).toHaveLength(0)

    const level = 'info'
    const message = 'Example Message'
    await store.dispatch('log', { level, message })

    expect(store.state.events).toHaveLength(1)
  })

  it('should store event on dispatch of log action with correct log level', async () => {
    expect(store.state.events).toHaveLength(0)

    const level = 'info'
    const message = 'Example Message'
    await store.dispatch('log', { level, message })

    expect(store.state.events).toHaveLength(1)
    expect(store.state.events[0].level).toEqual(level)
  })

  it('should store event on dispatch of log action with correct message', async () => {
    expect(store.state.events).toHaveLength(0)

    const level = 'info'
    const message = 'Example Message'
    await store.dispatch('log', { level, message })

    expect(store.state.events).toHaveLength(1)
    expect(store.state.events[0].message).toEqual(message)
  })

  it('should store event on dispatch of log action with correct stack', async () => {
    expect(store.state.events).toHaveLength(0)

    const level = 'info'
    const message = 'Example Message'
    const stack = 'Error: Example Stack Message\n\tat Example (example/example.js:0:0)'
    await store.dispatch('log', { level, message, stack })

    expect(store.state.events).toHaveLength(1)
    expect(store.state.events[0].stack).toEqual(stack)
  })
})
