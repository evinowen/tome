import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { DOMWrapper } from '@vue/test-utils'
import { File } from '@/store'
import ImageView from '@/components/EditorInterface/View/ImageView.vue'
import BasicComponent from '?/stubs/BasicComponent.vue'

HTMLElement.prototype.setPointerCapture = vi.fn()
HTMLElement.prototype.releasePointerCapture = vi.fn()

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
    wrapper.vm.zoom = 100

    expect(wrapper.vm.zoom).toBe(100)

    const file = new File({ name: './file.md' })
    wrapper.setProps({ file })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.zoom).toBe(0)
  })

  it('should call scrollTo for parent preview element when image is clicked', async () => {
    const wrapper = factory.wrap()
    expect(wrapper.vm.zoom).toBe(0)

    const preview = wrapper.find({ ref: 'preview' }) as DOMWrapper<HTMLElement>
    const spy_scrollTo = vi.spyOn(preview.element, 'scrollTo')

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      offsetX: 64,
      offsetY: 64,
    }

    image.trigger('pointerup', event)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.zoom).toBe(100)
    expect(spy_scrollTo).toHaveBeenCalled()
  })

  it('should not zoom or call scrollTo for parent preview element when image is clicked and dragging is true', async () => {
    const wrapper = factory.wrap()
    expect(wrapper.vm.zoom).toBe(0)

    wrapper.vm.dragging = true
    expect(wrapper.vm.dragging).toBe(true)

    const preview = wrapper.find({ ref: 'preview' }) as DOMWrapper<HTMLElement>
    const spy_scrollTo = vi.spyOn(preview.element, 'scrollTo')

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      offsetX: 64,
      offsetY: 64,
    }

    image.trigger('pointerup', event)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.zoom).not.toBe(100)
    expect(spy_scrollTo).not.toHaveBeenCalled()
  })

  it('should set dragable true on pointerdown event', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.dragable).toBe(false)

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      offsetX: 64,
      offsetY: 64,
    }

    image.trigger('pointerdown', event)

    expect(wrapper.vm.dragable).toBe(true)
  })

  it('should store mouse position on pointerdown event', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.mouseposition_x).toBe(0)
    expect(wrapper.vm.mouseposition_y).toBe(0)

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      screenX: 64,
      screenY: 128,
    }

    image.trigger('pointerdown', event)

    expect(wrapper.vm.mouseposition_x).toBe(64)
    expect(wrapper.vm.mouseposition_y).toBe(128)
  })

  it('should recalculate zoom on wheel event', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.zoom = -100
    expect(wrapper.vm.zoom).toBe(-100)

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      deltaY: 128,
    }

    image.trigger('wheel', event)

    expect(wrapper.vm.zoom).toBe(0)
  })

  it('should not set dragging to true on pointermove event when dragable is false', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.dragable).toBe(false)
    expect(wrapper.vm.dragging).toBe(false)

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      screenX: 64,
      screenY: 128,
    }

    image.trigger('pointermove', event)

    expect(wrapper.vm.dragging).toBe(false)
  })

  it('should set dragging to true on pointermove event when dragable is true', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.dragable = true
    expect(wrapper.vm.dragable).toBe(true)
    expect(wrapper.vm.dragging).toBe(false)

    const image = wrapper.find({ ref: 'image' })
    expect(image.exists()).toBe(true)

    const event = {
      offsetX: 64,
      offsetY: 64,
    }

    image.trigger('pointermove', event)

    expect(wrapper.vm.dragging).toBe(true)
  })
})
