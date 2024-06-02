import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Commit from '@/components/Commit.vue'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import { fetch_repository_committer_signature_store } from '@/store/modules/repository/committer/signature'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_system_store } from '@/store/modules/system'

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

  it('should dispatch repository/committer/signature/name with new value when sign_name is called with a value', async () => {
    const repository_committer_signature = fetch_repository_committer_signature_store()

    const wrapper = factory.wrap()

    const name = 'John Doe'
    await wrapper.vm.sign_name(name)

    expect(repository_committer_signature.sign_name).toHaveBeenCalledWith(name)
  })

  it('should dispatch repository/committer/signature/email with new value when sign_email is called with a value', async () => {
    const repository_committer_signature = fetch_repository_committer_signature_store()

    const wrapper = factory.wrap()

    const email = 'test@example.com'
    await wrapper.vm.sign_email(email)

    expect(repository_committer_signature.sign_email).toHaveBeenCalledWith(email)
  })

  it('should dispatch repository/committer/signature/message with new value when sign_message is called with a value', async () => {
    const repository_committer_signature = fetch_repository_committer_signature_store()

    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.sign_message(message)

    expect(repository_committer_signature.sign_message).toHaveBeenCalledWith(message)
  })

  it('should dispatch system/commit with false when close is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ commit: false })
  })

  it('should dispatch system/commit_confirm with new value when confirm is called with a value', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.confirm(true)

    expect(system.page).toHaveBeenCalledWith({ commit_confirm: true })
  })

  it('should dispatch system/commit_push with new value when push is called with a value', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.push(true)

    expect(system.page).toHaveBeenCalledWith({ commit_push: true })
  })

  it('should dispatch repository/comparator/diff with path when diff is called with file', async () => {
    const repository_comparator = fetch_repository_comparator_store()

    const wrapper = factory.wrap()

    const path = './file.md'

    await wrapper.vm.diff(path)

    expect(repository_comparator.diff).toHaveBeenCalledWith({ path })
  })

  it('should dispatch system/patch with true when diff is called with file', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const file = {
      path: './file.md',
    }

    await wrapper.vm.diff(file)

    expect(system.page).toHaveBeenCalledWith({ patch: true })
  })

  it('should dispatch repository/committer/stage with path when stage is called with path', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    expect(repository_committer.stage).toHaveBeenCalledWith(path)
  })

  it('should dispatch repository/committer/reset with path when reset is called with path', async () => {
    const repository_committer = fetch_repository_committer_store()

    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    expect(repository_committer.reset).toHaveBeenCalledWith(path)
  })

  it('should dispatch system/perform for commit when commit is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    expect(system.perform).toHaveBeenCalledWith('commit')
  })
})
