import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BranchesNameEditLabel from '@/components/BranchesNameEditLabel.vue'

describe('components/BranchesNameEditLabel', () => {
  let vuetify

  const factory = assemble(BranchesNameEditLabel)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponent,
          VIcon: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should emit "update" event when "blur" event is emitted from input', async () => {
    const value = 'master'

    const wrapper = factory.wrap({ value, visible: true })

    const input = wrapper.find({ ref: 'input' })
    await input.trigger('blur')

    expect(wrapper.emitted().update).toBeTruthy()
  })

  it('should emit "update" event when "keydown" event for enter is emitted from input', async () => {
    const value = 'master'

    const wrapper = factory.wrap({ value, visible: true })

    const input = wrapper.find({ ref: 'input' })
    await input.trigger('keydown', { key: 'enter' })

    expect(wrapper.emitted().update).toBeTruthy()
  })

  it('should update model value to value property when visibility flag property is set true', async () => {
    const value = 'master'

    const wrapper = factory.wrap({ value, visible: false })

    expect(wrapper.vm.model).toEqual('')

    await wrapper.setProps({ visible: true })

    expect(wrapper.vm.model).toEqual(value)
  })
})
