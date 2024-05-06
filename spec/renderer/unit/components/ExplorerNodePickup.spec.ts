import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import ExplorerNodePickup from '@/components/ExplorerNodePickup.vue'

describe('components/ExplorerNodePickup', () => {
  let vuetify
  let store
  let store_dispatch

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      actions: stub_actions([
        'files/drag',
        'files/drop',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(ExplorerNodePickup)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
      },
    }))

  it('is able to be mocked and prepared for testing', () => {
    const path = '/example'
    const wrapper = factory.wrap({ path, enabled: true })
    expect(wrapper).not.toBeUndefined()
  })

  it('should dispatch files/drag with path property when dragstart event is emited from draggable', async () => {
    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: true })

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('dragstart', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/drag', path)
  })

  it('should not dispatch files/drag when dragstart event is emited from draggable while enabled is false', async () => {
    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: false })

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('dragstart', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(store_dispatch).not.toHaveBeenCalledWith('files/drag', path)
  })

  it('should lower opacity of draggable when dragstart event is emited from draggable', async () => {
    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: true })

    const draggable = wrapper.find<HTMLElement>({ ref: 'draggable' })
    expect(draggable.element.style.opacity).toBe('')

    await draggable.trigger('dragstart', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(draggable.element.style.opacity).toBe('0.2')
  })

  it('should dispatch files/drop with path property when drop event is emited from draggable', async () => {
    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('drop', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/drop', path)
  })

  // it('should dispatch file move action when drop is triggered for a node', async () => {
  //   const wrapper = factory.wrap()
  //   wrapper.vm.hold = hold
  //   await wrapper.vm.$nextTick()

  //   store_dispatch.mockClear()

  //   const context = {
  //     directory: false,
  //   }

  //   expect(store_dispatch).toHaveBeenCalledTimes(0)

  //   const node = wrapper.findComponent({ ref: 'root-node' })
  //   await node.vm.$emit('drop', { context })
  //   await wrapper.vm.$nextTick()

  //   expect(store_dispatch).toHaveBeenCalledTimes(1)
  //   expect(store_dispatch.mock.calls[0][0]).toBe('files/move')
  // })
})
