import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Commit from '@/components/Commit'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))
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

    store.state = {
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
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/signature/name with new value when sign_name is called with a value', async () => {
    const wrapper = factory.wrap()

    const name = 'John Doe'
    await wrapper.vm.sign_name(name)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/name')

    expect(action).toBeDefined()
    expect(data).toEqual(name)
  })

  it('should dispatch system/signature/email with new value when sign_email is called with a value', async () => {
    const wrapper = factory.wrap()

    const email = 'test@example.com'
    await wrapper.vm.sign_email(email)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/email')

    expect(action).toBeDefined()
    expect(data).toEqual(email)
  })

  it('should dispatch system/signature/message with new value when sign_message is called with a value', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.sign_message(message)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch system/commit with false when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should dispatch system/commit_confirm with new value when confirm is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.confirm(true)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit_confirm')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/commit_push with new value when push is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.push(true)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit_push')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch repository/message with message when message is called with message', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.message(message)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'repository/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch repository/diff with path when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const file = {
      path: './file.md'
    }

    await wrapper.vm.diff(file)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'repository/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: file.path })
  })

  it('should dispatch system/patch with true when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const file = {
      path: './file.md'
    }

    await wrapper.vm.diff(file)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/patch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch repository/stage with path when stage is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'repository/stage')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch repository/reset with path when reset is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'repository/reset')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch system/perform for commit when commit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual('commit')
  })
})
