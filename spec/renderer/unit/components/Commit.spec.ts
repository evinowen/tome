import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as RepositoryCommitterStateDefaults } from '@/store/modules/repository/committer'
import { StateDefaults as RepositoryCommitterSignatureStateDefaults } from '@/store/modules/repository/committer/signature'
import { StateDefaults as RepositoryCredentialStateDefaults } from '@/store/modules/repository/credentials'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import Commit from '@/components/Commit.vue'

vi.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

describe('components/Commit', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(Commit)
    .context(() => ({
      vuetify,
      global: {
        plugins: [ vuetify, [ store, key ] ],
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

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
        repository: {
          ...RepositoryStateDefaults(),
          committer: {
            ...RepositoryCommitterStateDefaults(),
            signature: RepositoryCommitterSignatureStateDefaults(),
          },
          credentials: RepositoryCredentialStateDefaults(),
        },
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'repository/comparator/diff',
        'repository/message',
        'repository/committer/reset',
        'repository/committer/signature/email',
        'repository/committer/signature/message',
        'repository/committer/signature/name',
        'repository/committer/stage',
        'system/commit_confirm',
        'system/commit_push',
        'system/commit',
        'system/patch',
        'system/perform',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch repository/committer/signature/name with new value when sign_name is called with a value', async () => {
    const wrapper = factory.wrap()

    const name = 'John Doe'
    await wrapper.vm.sign_name(name)

    expect(store_dispatch).toHaveBeenCalledWith('repository/committer/signature/name', name)
  })

  it('should dispatch repository/committer/signature/email with new value when sign_email is called with a value', async () => {
    const wrapper = factory.wrap()

    const email = 'test@example.com'
    await wrapper.vm.sign_email(email)

    expect(store_dispatch).toHaveBeenCalledWith('repository/committer/signature/email', email)
  })

  it('should dispatch repository/committer/signature/message with new value when sign_message is called with a value', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.sign_message(message)

    expect(store_dispatch).toHaveBeenCalledWith('repository/committer/signature/message', message)
  })

  it('should dispatch system/commit with false when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/commit', false)
  })

  it('should dispatch system/commit_confirm with new value when confirm is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.confirm(true)

    expect(store_dispatch).toHaveBeenCalledWith('system/commit_confirm', true)
  })

  it('should dispatch system/commit_push with new value when push is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.push(true)

    expect(store_dispatch).toHaveBeenCalledWith('system/commit_push', true)
  })

  it('should dispatch repository/message with message when message is called with message', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.message(message)

    expect(store_dispatch).toHaveBeenCalledWith('repository/message', message)
  })

  it('should dispatch repository/comparator/diff with path when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'

    await wrapper.vm.diff(path)

    expect(store_dispatch).toHaveBeenCalledWith('repository/comparator/diff', { path })
  })

  it('should dispatch system/patch with true when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const file = {
      path: './file.md',
    }

    await wrapper.vm.diff(file)

    expect(store_dispatch).toHaveBeenCalledWith('system/patch', true)
  })

  it('should dispatch repository/committer/stage with path when stage is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    expect(store_dispatch).toHaveBeenCalledWith('repository/committer/stage', path)
  })

  it('should dispatch repository/committer/reset with path when reset is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    expect(store_dispatch).toHaveBeenCalledWith('repository/committer/reset', path)
  })

  it('should dispatch system/perform for commit when commit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    expect(store_dispatch).toHaveBeenCalledWith('system/perform', 'commit')
  })
})
