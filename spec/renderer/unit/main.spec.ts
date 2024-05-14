import { describe, afterEach, it, expect, vi } from 'vitest'

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

const store = { state: {}, dispatch: vi.fn() }
const key = '1234'
vi.doMock('@/store', () => ({ store, key }))

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
    expect(store.dispatch).not.toHaveBeenCalled()

    await import('@/main')

    expect(store.dispatch).toHaveBeenCalled()
    expect(store.dispatch).toHaveBeenCalledWith('hydrate')
  })

  it('loads the store plugin with the identified key', async () => {
    expect(mocked_app.use).not.toHaveBeenCalled()

    await import('@/main')

    expect(mocked_app.use).toHaveBeenCalledWith(store, key)
  })

  it('loads the vuetify plugin', async () => {
    expect(mocked_app.use).not.toHaveBeenCalled()

    await import('@/main')

    expect(mocked_app.use).toHaveBeenCalledWith(vuetify)
  })
})
