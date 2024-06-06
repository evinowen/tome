import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import Commit from '@/components/Commit.vue'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_error_store } from '@/store/modules/error'

vi.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

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

  it('should call "error.show" when confirm is called and "repository_committer_signature.check" returns false', async () => {
    const repository_committer_signature = fetch_repository_committer_signature_store()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository_committer_signature.check = vi.fn(async () => false) as any

    const error = fetch_error_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm()

    expect(error.show).toHaveBeenCalled()
  })

  it('should call "system.page" with true commit_confirm flag when confirm is called and "repository_committer_signature.check" returns true', async () => {
    const repository_committer_signature = fetch_repository_committer_signature_store()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repository_committer_signature.check = vi.fn(async () => true) as any

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
