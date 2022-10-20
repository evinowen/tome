import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Commit from '@/components/Commit.vue'

jest.mock('@/store', () => ({
  state: {
    system: {
      commit: false,
      commit_confirm: false,
      commit_push: false,
      signature: {
        name: '',
        email: '',
        message: ''
      }
    },
    repository: {
      status: {
        staged: [],
        available: []
      },
      signature: {
        name: 'Fred',
        email: 'fred@example.com'
      },
      message: ''
    },
    configuration: {
      auto_push: false,
      private_key: './id_rsa',
      passphrase: '1234'
    }
  },
  dispatch: jest.fn()
}))

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

describe('components/Commit', () => {
  let vuetify

  const factory = assemble(Commit)
    .context(() => ({
      vuetify,
      stubs: {
        CommitList: true,
        CommitConfirm: true,
        VDataTable: true
      }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()


  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/signature/name with new value when sign_name is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const name = 'John Doe'
    await local.sign_name(name)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/signature/name')

    expect(action).toBeDefined()
    expect(data).toEqual(name)
  })

  it('should dispatch system/signature/email with new value when sign_email is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const email = 'test@example.com'
    await local.sign_email(email)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/signature/email')

    expect(action).toBeDefined()
    expect(data).toEqual(email)
  })

  it('should dispatch system/signature/message with new value when sign_message is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const message = 'Test Message'
    await local.sign_message(message)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/signature/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch system/commit with false when close is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    await local.close()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should dispatch system/commit_confirm with new value when confirm is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    await local.confirm(true)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/commit_confirm')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/commit_push with new value when push is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    await local.push(true)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/commit_push')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch repository/message with message when message is called with message', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const message = 'Test Message'
    await local.message(message)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch repository/diff with path when diff is called with file', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const file = {
      path: './file.md'
    }

    await local.diff(file)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: file.path })
  })

  it('should dispatch system/patch with true when diff is called with file', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const file = {
      path: './file.md'
    }

    await local.diff(file)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/patch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch repository/stage with path when stage is called with path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const path = './file.md'
    await local.stage(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/stage')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch repository/reset with path when reset is called with path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    const path = './file.md'
    await local.reset(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/reset')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch system/perform for commit when commit is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Commit

    await local.commit()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual('commit')
  })
})
