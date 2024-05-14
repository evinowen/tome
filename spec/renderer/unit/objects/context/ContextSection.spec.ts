import { describe, afterEach, it, expect, vi } from 'vitest'
import ContextItem from '@/objects/context/ContextItem'
import ContextSection from '@/objects/context/ContextSection'

vi.mock('@/objects/context/ContextItem', () => ({
  default: class {
    target: string
    divider = false

    static divider () {
      return { divider: true }
    }
  },
}))

describe('objects/context/ContextSection', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not add item to items array on call to add if conditional is false', async () => {
    const section = new ContextSection().add(false, new ContextItem())

    expect(section.items).toHaveLength(0)
  })

  it('should add item to items array on call to add if conditional is true', async () => {
    const section = new ContextSection().add(true, new ContextItem())

    expect(section.items).toHaveLength(1)
  })
})
