import { describe, afterEach, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { fetch_application_store } from '@/store/modules/application'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

const mocked_app = {
  use: vi.fn(),
  mount: vi.fn(),
}

const mocked_createApp = vi.fn(() => mocked_app)

vi.doMock('vue', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual('vue') as any
  return {
    ...actual,
    createApp: mocked_createApp,
    h: vi.fn(),
  }
})

vi.doMock('pinia', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual('pinia') as any
  return {
    ...actual,
    createPinia: () => createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    }),
  }
})

const vuetify = {}
vi.doMock('@/vuetify', () => ({ default: vuetify }))

vi.doMock('@/components/App.vue', () => ({ default: {} }))

describe('main', () => {
  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', async () => {
    await import('@/main')
  })

  it('calls store hydrate action to prepare state', async () => {
    await import('@/main')

    const application = fetch_application_store()
    expect(application.hydrate).toHaveBeenCalledWith()
  })

  it('loads the vuetify plugin', async () => {
    expect(mocked_app.use).not.toHaveBeenCalled()

    await import('@/main')

    expect(mocked_app.use).toHaveBeenCalledWith(vuetify)
  })
})
