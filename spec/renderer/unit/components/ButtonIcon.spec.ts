import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import ButtonIcon from '@/components/ButtonIcon.vue'

describe('components/ButtonIcon', () => {
  let vuetify

  const factory = assemble(ButtonIcon)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should set blank modifier value when badge value is set to blank', async () => {
    const wrapper = factory.wrap({ badge: '' })

    expect(wrapper.vm.modifier).toEqual('')
  })

  it('should set modifier value to modify-cog when badge value is set to mdi-cog', async () => {
    const wrapper = factory.wrap({ badge: 'mdi-cog' })

    expect(wrapper.vm.modifier).toEqual('modify-cog')
  })

  it('should set modifier value to modify-eye when badge value is set to mdi-eye-circle', async () => {
    const wrapper = factory.wrap({ badge: 'mdi-eye-circle' })

    expect(wrapper.vm.modifier).toEqual('modify-eye')
  })

  it('should set modifier value to modify-js when badge value is set to mdi-language-javascript', async () => {
    const wrapper = factory.wrap({ badge: 'mdi-language-javascript' })

    expect(wrapper.vm.modifier).toEqual('modify-js')
  })

  it('should set modifier value to modify-lock when badge value is set to mdi-lock', async () => {
    const wrapper = factory.wrap({ badge: 'mdi-lock' })

    expect(wrapper.vm.modifier).toEqual('modify-lock')
  })

  it('should set modifier value to modify-json when badge value is set to mdi-code-json', async () => {
    const wrapper = factory.wrap({ badge: 'mdi-code-json' })

    expect(wrapper.vm.modifier).toEqual('modify-json')
  })
})
