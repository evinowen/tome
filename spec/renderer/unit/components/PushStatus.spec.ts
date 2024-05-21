import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import VDataTable from '?/stubs/VDataTable.vue'
import { createVuetify } from 'vuetify'
import PushStatus from '@/components/PushStatus.vue'

describe('components/PushStatus', () => {
  let vuetify

  const factory = assemble(PushStatus)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VAvatar: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardText: BasicComponentStub,
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
          VList: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VListItemSubtitle: BasicComponentStub,
          VDataTable,
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

  it('should display content blank if inactive', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    const content_blank = wrapper.findComponent({ ref: 'blank-view' })
    expect(content_blank.exists()).toBe(true)

    const content_loading = wrapper.findComponent({ ref: 'loading-view' })
    expect(content_loading.exists()).toBe(false)

    const content_error = wrapper.findComponent({ ref: 'error-view' })
    expect(content_error.exists()).toBe(false)

    const content_match = wrapper.findComponent({ ref: 'match-view' })
    expect(content_match.exists()).toBe(false)

    const content_compare = wrapper.findComponent({ ref: 'compare-view' })
    expect(content_compare.exists()).toBe(false)
  })

  it('should display loading content if active and loading flags are true', async () => {
    const wrapper = factory.wrap({ active: true, loading: true })
    expect(wrapper).toBeDefined()

    const content_blank = wrapper.findComponent({ ref: 'blank-view' })
    expect(content_blank.exists()).toBe(false)

    const content_loading = wrapper.findComponent({ ref: 'loading-view' })
    expect(content_loading.exists()).toBe(true)

    const content_error = wrapper.findComponent({ ref: 'error-view' })
    expect(content_error.exists()).toBe(false)

    const content_match = wrapper.findComponent({ ref: 'match-view' })
    expect(content_match.exists()).toBe(false)

    const content_compare = wrapper.findComponent({ ref: 'compare-view' })
    expect(content_compare.exists()).toBe(false)
  })

  it('should display error content if active and error flags are true', async () => {
    const wrapper = factory.wrap({ active: true, error: 'Error!' })
    expect(wrapper).toBeDefined()

    const content_blank = wrapper.findComponent({ ref: 'blank-view' })
    expect(content_blank.exists()).toBe(false)

    const content_loading = wrapper.findComponent({ ref: 'loading-view' })
    expect(content_loading.exists()).toBe(false)

    const content_error = wrapper.findComponent({ ref: 'error-view' })
    expect(content_error.exists()).toBe(true)

    const content_match = wrapper.findComponent({ ref: 'match-view' })
    expect(content_match.exists()).toBe(false)

    const content_compare = wrapper.findComponent({ ref: 'compare-view' })
    expect(content_compare.exists()).toBe(false)
  })

  it('should display match content if active and match flags are true', async () => {
    const wrapper = factory.wrap({ active: true, match: true })
    expect(wrapper).toBeDefined()

    const content_blank = wrapper.findComponent({ ref: 'blank-view' })
    expect(content_blank.exists()).toBe(false)

    const content_loading = wrapper.findComponent({ ref: 'loading-view' })
    expect(content_loading.exists()).toBe(false)

    const content_error = wrapper.findComponent({ ref: 'error-view' })
    expect(content_error.exists()).toBe(false)

    const content_match = wrapper.findComponent({ ref: 'match-view' })
    expect(content_match.exists()).toBe(true)

    const content_compare = wrapper.findComponent({ ref: 'compare-view' })
    expect(content_compare.exists()).toBe(false)
  })

  it('should display compare content if active and compare flags are true', async () => {
    const wrapper = factory.wrap({ active: true, compare: true })
    expect(wrapper).toBeDefined()

    const content_blank = wrapper.findComponent({ ref: 'blank-view' })
    expect(content_blank.exists()).toBe(false)

    const content_loading = wrapper.findComponent({ ref: 'loading-view' })
    expect(content_loading.exists()).toBe(false)

    const content_error = wrapper.findComponent({ ref: 'error-view' })
    expect(content_error.exists()).toBe(false)

    const content_match = wrapper.findComponent({ ref: 'match-view' })
    expect(content_match.exists()).toBe(false)

    const content_compare = wrapper.findComponent({ ref: 'compare-view' })
    expect(content_compare.exists()).toBe(true)
  })
})
