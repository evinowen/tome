import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as InputSelectStateDefaults } from '@/store/modules/input/select'
import SelectInputOverlay from '@/components/SelectInputOverlay.vue'
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
  let store
  let store_dispatch

  const factory = assemble(SelectInputOverlay)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
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

    store = createStore<State>({
      state: {
        input: {
          select: {
            ...InputSelectStateDefaults(),
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
      },
      actions: stub_actions([
        'input/select/set',
        'input/select/close',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch "input/select/set" upon call to select method', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.select(store.state.input.select.identifier, store.state.input.select.options[0])

    expect(store_dispatch).toHaveBeenCalledWith('input/select/set', {
      identifier: store.state.input.select.identifier,
      option: store.state.input.select.options[0],
    })
  })

  it('should dispatch "input/select/filter" upon call to close method', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('input/select/close')
  })
})
