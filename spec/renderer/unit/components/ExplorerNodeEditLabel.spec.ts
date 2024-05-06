import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import ExplorerNodeEditLabel from '@/components/ExplorerNodeEditLabel.vue'

describe('components/ExplorerNodeEditLabel', () => {
  let vuetify
  let store
  let store_dispatch

  const path = '/path'

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
      },
      actions: stub_actions([
        'files/blur',
        'files/submit',
        'validation/hide',
        'validation/show',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(ExplorerNodeEditLabel, { path, value: '' })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VIcon: BasicComponentStub,
        },
      },
    }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()
    expect(wrapper).not.toBeUndefined()
  })

  it('should call focus and select on input element when active property becomes true', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    const input_focus = vi.spyOn(input.element, 'focus')
    const input_select = vi.spyOn(input.element, 'select')

    expect(input_focus).not.toHaveBeenCalled()
    expect(input_select).not.toHaveBeenCalled()

    await wrapper.setProps({ active: true })

    await wrapper.vm.$nextTick()

    expect(input_focus).toHaveBeenCalled()
    expect(input_select).toHaveBeenCalled()
  })

  it('should call blur on input element when input element emits keyup event for escape key', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    const input_blur = vi.spyOn(input.element, 'blur')

    expect(input_blur).not.toHaveBeenCalled()

    await input.trigger('keyup', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(input_blur).toHaveBeenCalled()
  })

  it('should not call blur on input element when input element emits keyup event for other keys', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    const input_blur = vi.spyOn(input.element, 'blur')

    expect(input_blur).not.toHaveBeenCalled()

    await input.trigger('keyup', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    expect(input_blur).not.toHaveBeenCalled()
  })

  it('should dispatch validation/hide when input element emits blur event', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })

    await input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('validation/hide', { element: input.element })
  })

  it('should dispatch files/blur when input element emits blur event', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })

    await input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('files/blur', { path })
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value with special characters', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = '%%%'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'Special characters are not allowed',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value with adjacent divider characters', async () => {
    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = '...'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'Adjacent divider characters are not allowed',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value with spaces when titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'Example Value'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'Whitespace is not allowed.',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value with dots when titles are formatted', async () => {
    store.state.configuration.format_explorer_titles = true

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'Example.Value'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'Special characters are not allowed.',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value without file extension when titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'example'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'File extension is required.',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/show with error when input element emits input and value is set to value without file name when titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = '.md'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
      message: 'File name is required.',
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/show', context)
  })

  it('should dispatch validation/hide when input element emits input with a valid value set and titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'example.file.md'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/hide', context)
  })

  it('should dispatch validation/hide when input element emits input with a valid value set and titles are formatted', async () => {
    store.state.configuration.format_explorer_titles = true

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'Example File'
    await input.trigger('input')

    await wrapper.vm.$nextTick()

    const context = {
      element: input.element,
    }

    expect(store_dispatch).toHaveBeenCalledWith('validation/hide', context)
  })

  it('should dispatch files/submit when input element emits input with a valid value set and titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'example.file.md'
    await input.trigger('submit')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const context = {
      input: input.element.value,
      title: store.state.configuration.format_explorer_titles,
    }

    expect(store_dispatch).toHaveBeenCalledWith('files/submit', context)
  })

  it('should not dispatch files/submit when input element emits input with an invalid value set and titles are not formatted', async () => {
    store.state.configuration.format_explorer_titles = false

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'example'
    await input.trigger('submit')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const context = {
      input: input.element.value,
      title: store.state.configuration.format_explorer_titles,
    }

    expect(store_dispatch).not.toHaveBeenCalledWith('files/submit', context)
  })

  it('should dispatch files/submit when input element emits input with a valid value set and titles are formatted', async () => {
    store.state.configuration.format_explorer_titles = true

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'Example File'
    await input.trigger('submit')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const context = {
      input: input.element.value,
      title: store.state.configuration.format_explorer_titles,
    }

    expect(store_dispatch).toHaveBeenCalledWith('files/submit', context)
  })

  it('should not dispatch files/submit when input element emits input with an invalid value set and titles are formatted', async () => {
    store.state.configuration.format_explorer_titles = true

    const wrapper = factory.wrap()

    const input = wrapper.find<HTMLInputElement>({ ref: 'input' })
    input.element.value = 'Example.File'
    await input.trigger('submit')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const context = {
      input: input.element.value,
      title: store.state.configuration.format_explorer_titles,
    }

    expect(store_dispatch).not.toHaveBeenCalledWith('files/submit', context)
  })
})
