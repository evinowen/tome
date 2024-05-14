import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import ContextItem from '@/objects/context/ContextItem'
import ContextMenuItem from '@/components/ContextMenuItem.vue'
import BasicComponentStub from '?/stubs/BasicComponent.vue'

vi.mock('@/objects/context/ContextItem', () => ({
  default: class {
    title = ''
    divider = false
    items: ContextItem[]

    active?: () => Promise<boolean>
    action?: (target: string) => Promise<void>
    load?: () => Promise<ContextItem[]>

    display = vi.fn()
    execute = vi.fn()
    shortcut = vi.fn()
  },
}))

describe('components/ContextMenuItem', () => {
  let vuetify

  let item: ContextItem
  let direction: string

  const factory = assemble(ContextMenuItem).context(() => ({
    global: {
      plugins: [ vuetify ],
      stubs: {
        VListItem: BasicComponentStub,
        VListItemTitle: BasicComponentStub,
        VIcon: BasicComponentStub,
      },
    },
  }))

  beforeEach(() => {
    item = new ContextItem()
    direction = 'left'

    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set parent flag to false if property item ContextItem has undefined items and load members', async () => {
    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.vm.parent).toBe(false)
  })

  it('should set parent flag to true if property item ContextItem has defined items member', async () => {
    item.items = []

    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.vm.parent).toBe(true)
  })

  it('should set parent flag to true if property item ContextItem has defined load member', async () => {
    item.load = async () => []

    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.vm.parent).toBe(true)
  })

  it('should call display on property item ContentItem on call to promote method', async () => {
    item.load = async () => []

    const wrapper = factory.wrap({ item, direction })

    expect(item.display).not.toHaveBeenCalled()

    await wrapper.vm.promote()

    expect(item.display).toHaveBeenCalled()
  })

  it('should emit promote event on call to promote method', async () => {
    item.load = async () => []

    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.emitted().promote).toBeUndefined()

    await wrapper.vm.promote()

    expect(wrapper.emitted().promote).toHaveLength(1)
  })

  it('should not emit close event on call to execute method when property item ContextItem has undefined action member', async () => {
    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.emitted().close).toBeUndefined()

    await wrapper.vm.execute(item)

    expect(wrapper.emitted().close).toBeUndefined()
  })

  it('should emit close event on call to execute method when property item ContextItem has defined action member', async () => {
    item.action = async () => { /* Empty */ }

    const wrapper = factory.wrap({ item, direction })

    expect(wrapper.emitted().close).toBeUndefined()

    await wrapper.vm.execute(item)

    expect(wrapper.emitted().close).toHaveLength(1)
  })
})
