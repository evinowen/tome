import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import * as vuetify from 'vuetify'

describe('vuetify', () => {
  let spy_createVuetify

  beforeEach(() => {
    spy_createVuetify = vi.spyOn(vuetify, 'createVuetify')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('is able to create an instance of vuetify via the createVuetify method', async () => {
    expect(spy_createVuetify).not.toHaveBeenCalled()

    const { default: vuetify } = await import('@/vuetify')

    expect(spy_createVuetify).toHaveBeenCalled()
    expect(spy_createVuetify).toHaveReturnedWith(vuetify)
  })

  it('is able to generate preset values for theme colors', async () => {
    const { presets } = await import('@/vuetify')

    expect(presets).toBeDefined()
    expect(presets.light).toBeDefined()
    expect(presets.dark).toBeDefined()
  })
})
