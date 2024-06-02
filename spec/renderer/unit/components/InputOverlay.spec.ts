import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import SelectInputOverlay from '@/components/SelectInputOverlay.vue'
import { fetch_input_select_store } from '@/store/modules/input/select'
import { v4 as uuidv4 } from 'uuid'

class MockHTMLElement {
  getBoundingClientRect () {
    return {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
    }
  }
}

describe('components/SelectInputOverlay', () => {
  let vuetify
  let pinia

  const factory = assemble(SelectInputOverlay)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VList: BasicComponent,
          VListItem: BasicComponent,
          VListItemTitle: BasicComponent,
          VListItemSubtitle: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'input-select': {
          identifier: uuidv4().toString(),
          element: (new MockHTMLElement()) as HTMLElement,
          visible: true,
          options: [
            { value: 'value-a', label: 'label-a', detail: 'detail-a' },
            { value: 'value-b', label: 'label-b', detail: 'detail-b' },
            { value: 'value-c', label: 'label-c', detail: 'detail-c' },
          ],
          active: [
            { value: 'value-a', label: 'label-a', detail: 'detail-a' },
            { value: 'value-b', label: 'label-b', detail: 'detail-b' },
            { value: 'value-c', label: 'label-c', detail: 'detail-c' },
          ],
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch "input/select/set" upon call to select method', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap()

    await wrapper.vm.select(input_select.identifier, input_select.options[0])

    expect(input_select.select).toHaveBeenCalledWith({
      identifier: input_select.identifier,
      option: input_select.options[0],
    })
  })

  it('should dispatch "input/select/filter" upon call to close method', async () => {
    const input_select = fetch_input_select_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(input_select.close).toHaveBeenCalledWith()
  })
})
