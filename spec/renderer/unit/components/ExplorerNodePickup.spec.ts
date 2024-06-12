import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ExplorerNodePickup from '@/components/ExplorerNodePickup.vue'
import { fetch_files_store } from '@/store/modules/files'

describe('components/ExplorerNodePickup', () => {
  let vuetify
  let pinia

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(ExplorerNodePickup)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
      },
    }))

  it('is able to be mocked and prepared for testing', () => {
    const path = '/example'
    const wrapper = factory.wrap({ path, enabled: true })
    expect(wrapper).not.toBeUndefined()
  })

  it('should dispatch files/drag with path property when dragstart event is emited from draggable', async () => {
    const files = fetch_files_store()

    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: true })

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('dragstart', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(files.drag).toHaveBeenCalledWith(path)
  })

  it('should not dispatch files/drag when dragstart event is emited from draggable while enabled is false', async () => {
    const files = fetch_files_store()

    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: false })

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('dragstart', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(files.drag).not.toHaveBeenCalledWith(path)
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
    const files = fetch_files_store()

    const path = '/example'

    const wrapper = factory.wrap({ path, enabled: true })
    await wrapper.vm.$nextTick()

    // store_dispatch.mockClear()

    const draggable = wrapper.find({ ref: 'draggable' })
    await draggable.trigger('drop', {
      dataTransfer: {
        dropEffect: '',
      },
    })
    await wrapper.vm.$nextTick()

    expect(files.drop).toHaveBeenCalledWith(path)
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
