import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { DOMWrapper } from '@vue/test-utils'
import { File } from '@/store'
import ImageView from '@/components/EditorInterface/View/ImageView.vue'
import BasicComponent from '?/stubs/BasicComponent.vue'

describe('components/EditorInterface/View/ImageView', async () => {
  let vuetify

  const file = new File({ path: './index.md' })

  const factory = assemble(ImageView, { file })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          FileButtonIcon: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should set hide to true when error is called', () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.hide).toBe(false)

    wrapper.vm.error()

    expect(wrapper.vm.hide).toBe(true)
  })

  it('should reset hide to false when file target changes', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.hide = true

    expect(wrapper.vm.hide).toBe(true)

    const file = new File({ name: './file.md' })
    wrapper.setProps({ file })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.hide).toBe(false)
  })

  it('should reset zoom to false when file target changes', async () => {
    const wrapper = factory.wrap()
    wrapper.vm.zoom = true

    expect(wrapper.vm.zoom).toBe(true)

    const file = new File({ name: './file.md' })
    wrapper.setProps({ file })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.zoom).toBe(false)
  })

  it('should call scrollTo for parent preview element when image is clicked', async () => {
    const wrapper = factory.wrap()
    expect(wrapper.vm.zoom).toBe(false)

    const preview = wrapper.find({ ref: 'preview' }) as DOMWrapper<HTMLElement>
    const spy = vi.spyOn(preview.element, 'scrollTo')

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      offsetX: 64,
      offsetY: 64,
    }

    image.trigger('click', event)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.zoom).toBe(true)
    expect(spy).toHaveBeenCalled()
  })
})
