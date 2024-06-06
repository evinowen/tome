import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_application_store } from '@/store/application'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_library_store } from '@/store/modules/library'
import { fetch_system_store } from '@/store/modules/system'
import * as api_module from '@/api'
import builders from '?/builders'

vi.stubGlobal('document', {
  fonts: [
    { load: vi.fn() },
  ],
})

vi.mock('@/store/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/configuration', () => ({
  fetch_configuration_store: vi.fn(),
}))

vi.mock('@/store/modules/library', () => ({
  fetch_library_store: vi.fn(),
}))

vi.mock('@/store/modules/system', () => ({
  fetch_system_store: vi.fn(),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store', () => {
  let application

  let configuration
  let library
  let system

  const mock_fetch_configuration_store = vi.mocked(fetch_configuration_store)
  const mock_fetch_library_store = vi.mocked(fetch_library_store)
  const mock_fetch_system_store = vi.mocked(fetch_system_store)

  beforeEach(() => {
    setActivePinia(createPinia())
    application = fetch_application_store()

    configuration = {
      load_global: vi.fn(),
    }

    mock_fetch_configuration_store.mockReturnValue(configuration)

    library = {
      load: vi.fn(),
    }

    mock_fetch_library_store.mockReturnValue(library)

    system = {
      load: vi.fn(),
    }

    mock_fetch_system_store.mockReturnValue(system)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load configuration on dispatch of hydrate action', async () => {
    await application.hydrate()

    expect(configuration.load_global).toHaveBeenCalled()
  })

  it('should load library on dispatch of hydrate action', async () => {
    await application.hydrate()

    expect(library.load).toHaveBeenCalled()
  })
  it('should load system on dispatch of hydrate action', async () => {
    await application.hydrate()

    expect(system.load).toHaveBeenCalled()
  })
})
