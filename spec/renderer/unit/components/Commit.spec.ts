import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import Commit from '@/components/Commit.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_system_store } from '@/store/modules/system'
import CommitError from '@/objects/errors/CommitError'

vi.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

vi.mock('@/objects/errors/CommitError', () => ({
  default: vi.fn(async () => false),
}))

describe('components/Commit', () => {
  let vuetify
  let pinia

  const factory = assemble(Commit)
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          CommitList: true,
          CommitConfirm: true,
          UtilityPage,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCol: BasicComponentStub,
          VContainer: BasicComponentStub,
          VIcon: BasicComponentStub,
          VLayout: BasicComponentStub,
          VRow: BasicComponentStub,
          VTextarea: BasicComponentStub,
          VTextField: BasicComponentStub,
        },
      },
    }))

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

  it('should call "system.page" with false commit flag when close is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ commit: false })
  })

  it('should call "repository_committer.compose" with to trigger automatic commit message when generate button emits "click" event', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const generate_button = wrapper.findComponent({ ref: 'generate-button' })
    expect(generate_button.exists()).toBe(true)

    await generate_button.trigger('click')

    expect(repository_committer.compose).toHaveBeenCalledWith(undefined, true)
  })

  it('should call "configuration.localize" disabling signature locality upon call to signature_locality with SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()
    wrapper.vm.signature_locality(SettingsTarget.Global)

    expect(configuration.localize).toHaveBeenCalledWith('signature', false)
  })

  it('should call "configuration.localize" enabling signature locality upon call to signature_locality with SettingsTarget.Local', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()
    wrapper.vm.signature_locality(SettingsTarget.Local)

    expect(configuration.localize).toHaveBeenCalledWith('signature', true)
  })

  it('should not call "system.page" with true commit_confirm flag when confirm is called and CommitError returns true', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => true)

    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm()

    expect(system.page).not.toHaveBeenCalledWith({ commit_confirm: true })
  })

  it('should call "system.page" with true commit_confirm flag when confirm is called and CommitError returns false', async () => {
    const repository_committer = fetch_repository_committer_store()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository_committer.check = vi.fn(async () => true) as any

    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm()

    expect(system.page).toHaveBeenCalledWith({ commit_confirm: true })
  })

  it('should call "repository_comparator.diff" with path when diff is called with file', async () => {
    const repository_comparator = fetch_repository_comparator_store()

    const wrapper = factory.wrap()

    const path = './file.md'

    await wrapper.vm.diff(path)

    expect(repository_comparator.diff).toHaveBeenCalledWith({ path })
  })

  it('should call "system.page" with true patch flag when diff is called with file', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const file = {
      path: './file.md',
    }

    await wrapper.vm.diff(file)

    expect(system.page).toHaveBeenCalledWith({ patch: true })
  })

  it('should call "repository_committer.stage" with asterisk when stage-button emits "click" event', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const stage_button = wrapper.findComponent({ ref: 'stage-button' })
    expect(stage_button.exists()).toBe(true)

    stage_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(repository_committer.stage).toHaveBeenCalledWith('*')
  })

  it('should call "repository_committer.stage" with path when stage is called with path', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    expect(repository_committer.stage).toHaveBeenCalledWith(path)
  })

  it('should call "repository_committer.reset" with asterisk when reset-button emits "click" event', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const reset_button = wrapper.findComponent({ ref: 'reset-button' })
    expect(reset_button.exists()).toBe(true)

    reset_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(repository_committer.reset).toHaveBeenCalledWith('*')
  })

  it('should call "repository_committer.reset" with path when reset is called with path', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    expect(repository_committer.reset).toHaveBeenCalledWith(path)
  })
})
