/* eslint-disable unicorn/consistent-function-scoping */
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createTestingPinia } from '@pinia/testing'
import { File } from '@/store/modules/files'
import TextView from '@/components/EditorInterface/View/TextView.vue'

vi.mock('mark.js', () => {
  class Mark {
    unmark = vi.fn((options) => options.done(true))
    markRegExp = vi.fn((regex, options) => options.done(3))
  }

  return { default: Mark }
})

describe('components/EditorInterface/View/TextView', () => {
  const file = File.Empty
  let pinia

  const factory = assemble(TextView, { file })
    .context(() => ({
      global: {
        plugins: [ pinia ],
        stubs: {
          RenderedViewport: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })
})
