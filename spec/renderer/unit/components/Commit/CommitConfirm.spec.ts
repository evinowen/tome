import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import CommitConfirm, { CommitConfirmMessages } from '@/components/Commit/CommitConfirm.vue'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitError from '@/objects/errors/CommitError'

vi.mock('@/objects/errors/CommitError', () => ({
  default: vi.fn(async () => false),
}))

describe('components/Commit/CommitConfirm', () => {
  let vuetify
  let pinia

  const factory = assemble(CommitConfirm, { value: true })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          OverlayBox: BasicComponentStub,
          CommitMessageInput: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VIcon: BasicComponentStub,
          VListItem: BasicComponentStub,
          VListItemSubtitle: BasicComponentStub,
          VListItemTitle: BasicComponentStub,
          VProgressCircular: BasicComponentStub,
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should set status to ready message when repository_committer.process.staging is false', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.process.staging = false

    const wrapper = factory.wrap()

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Ready)
  })

  it('should set status to staging message when repository_committer.process.staging is true', async () => {
    const repository_committer = fetch_repository_committer_store()
    repository_committer.process.staging = true

    const wrapper = factory.wrap()

    expect(wrapper.vm.status).toEqual(CommitConfirmMessages.Staging)
  })

  it('should call "repository_committer.compose" with to trigger automatic commit message when generate button emits "click" event', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const generate_button = wrapper.findComponent({ ref: 'generate-button' })
    expect(generate_button.exists()).toBe(true)

    await generate_button.trigger('click')

    expect(repository_committer.compose).toHaveBeenCalledWith(undefined, true)
  })

  it('should call "system.perform" with SystemPerformance.Commit when commit button emits "click" event', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const commit_button = wrapper.findComponent({ ref: 'commit-button' })
    expect(commit_button.exists()).toBe(true)

    await commit_button.trigger('click')

    expect(system.perform).toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should not call "system.perform" with SystemPerformance.Commit if CommitError returns true when commit button emits "click" event', async () => {
    const mocked_CommitError = vi.mocked(CommitError)
    mocked_CommitError.mockImplementationOnce(async () => true)

    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const commit_button = wrapper.findComponent({ ref: 'commit-button' })
    expect(commit_button.exists()).toBe(true)

    await commit_button.trigger('click')

    expect(system.perform).not.toHaveBeenCalledWith(SystemPerformance.Commit)
  })

  it('should call "system.page" with inverted commit_push flag when push button emits "click" event', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const push_button = wrapper.findComponent({ ref: 'push-button' })
    expect(push_button.exists()).toBe(true)

    {
      const commit_push = system.commit_push

      await push_button.trigger('click')

      expect(system.page).toHaveBeenCalledWith({ commit_push: !commit_push })
    }

    {
      const commit_push = system.commit_push

      await push_button.trigger('click')

      expect(system.page).toHaveBeenCalledWith({ commit_push: !commit_push })
    }
  })

  it('should call "system.page" with false commit_push flag when commit_push is called with false', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.commit_push(false)

    expect(system.page).toHaveBeenCalledWith({ commit_push: false })
  })

  it('should call "system.page" with false commit_push flag when commit_push is called with true', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.commit_push(true)

    expect(system.page).toHaveBeenCalledWith({ commit_push: true })
  })

  it('should call "system.page" with false commit_confirm flag when return button emits "click" event', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const return_button = wrapper.findComponent({ ref: 'return-button' })
    expect(return_button.exists()).toBe(true)

    await return_button.trigger('click')

    expect(system.page).toHaveBeenCalledWith({ commit_confirm: false })
  })
})
