import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import CommitMessageInput from '@/components/Commit/CommitMessageInput.vue'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  pickBy: vi.fn(),
  merge: vi.fn(),
}))

describe('components/Commit/CommitMessageInput', () => {
  let vuetify
  let pinia

  const factory = assemble(CommitMessageInput)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VDivider: BasicComponentStub,
          VTextarea: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = SettingsStateDefaults()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should sync model repository_committer.message updated and focused is false', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.message = 'example-a'

    const wrapper = factory.wrap()
    expect(wrapper.vm.model).toEqual('example-a')
    expect(wrapper.vm.focused).toEqual(false)

    repository_committer.message = 'example-b'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.model).toEqual('example-b')
  })

  it('should set focused true when input emits blur event', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.message = 'example-a'

    const wrapper = factory.wrap()
    expect(wrapper.vm.focused).toEqual(false)

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)

    await input_field.trigger('focus')

    expect(wrapper.vm.focused).toEqual(true)
  })

  it('should not sync model repository_committer.message updated and focused is true', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.message = 'example-a'

    const wrapper = factory.wrap()
    expect(wrapper.vm.model).toEqual('example-a')

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)

    await input_field.trigger('focus')
    expect(wrapper.vm.focused).toEqual(true)

    repository_committer.message = 'example-b'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.model).not.toEqual('example-b')
  })

  it('should sync model when input emits blur event', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.message = 'example-a'

    const wrapper = factory.wrap()
    expect(wrapper.vm.model).toEqual('example-a')

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)
    await input_field.trigger('focus')

    repository_committer.message = 'example-b'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.model).not.toEqual('example-b')

    await input_field.trigger('blur')

    expect(wrapper.vm.model).toEqual('example-b')
  })

  it('should call "repository_committer.compose" with new value when input emits blur model update', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.message = 'example-a'

    const wrapper = factory.wrap()
    expect(wrapper.vm.model).toEqual('example-a')

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)
    await input_field.trigger('focus')

    repository_committer.message = 'example-b'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.model).not.toEqual('example-b')

    expect(input_field.exists()).toBe(true)

    input_field.vm.$emit('update:model-value', 'example-c')

    expect(repository_committer.compose).toHaveBeenCalledWith('example-c')
  })
})
