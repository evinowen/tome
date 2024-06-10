import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { assemble, Factory } from '../helpers'

export default <T>(name: string, component: T, properties: Record<string, any> = {}) => {
  return new ComponentTestHelperFactory<T>(name, component, properties)
}

class ComponentTestHelperFactory<T> {
  helper: ComponentTestHelper<T>

  constructor (name: string, component: T, properties: Record<string, any>) {
    this.helper = new ComponentTestHelper()

    this.helper.name = name
    this.helper.component = component
    this.helper.properties = properties
    this.helper.before = async () => { /* Empty */ }
    this.helper.after = async () => { /* Empty */ }
  }

  stub (stubs: any) {
    this.helper.stubs = stubs
    return this
  }

  store (state: any) {
    this.helper.state = state
    return this
  }

  before (action: () => Promise<void>) {
    this.helper.before = action
    return this
  }

  after (action: () => Promise<void>) {
    this.helper.after = action
    return this
  }

  async run (plan: (factory: Factory<T>) => Promise<void>) {
    await this.helper.run(plan)
  }
}

class ComponentTestHelper<T> {
  name: string
  component: T
  properties: Record<string, any>

  stubs: any
  state: any

  before: () => Promise<void>
  after: () => Promise<void>

  async run (plan: (factory: Factory<T>) => Promise<void>) {
    describe(this.name, async () => {
      let vuetify
      let pinia

      const factory = assemble(this.component, this.properties)
        .context(() => ({
          global: {
            plugins: [ vuetify, pinia ],
            stubs: this.stubs,
          },
        }))

      beforeEach(async () => {
        vuetify = createVuetify()

        pinia = createTestingPinia({
          createSpy: vi.fn,
          initialState: this.state,
        })

        await this.before()
      })

      afterEach(async () => {
        vi.clearAllMocks()

        await this.after()
      })

      it('should mount into test scafolding without error', async () => {
        const wrapper = factory.wrap()
        expect(wrapper).toBeDefined()
      })

      await plan(factory)
    })
  }
}
