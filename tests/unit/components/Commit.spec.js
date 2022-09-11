import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Commit from '@/components/Commit.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))
jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))

describe('Commit.vue', () => {
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
      tome: {
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

  // it('is able to be mocked and prepared for testing', async () => {
  //   const wrapper = factory.wrap()

  //   await wrapper.vm.$nextTick()

  //   expect(wrapper).not.toBeNull()
  // })

  // it('should load file diff and emit patch event on call to diff', async () => {
  //   const wrapper = factory.wrap()

  //   const event = jest.fn()

  //   wrapper.vm.$on('patch', event)

  //   expect(event).toHaveBeenCalledTimes(0)

  //   const file = { path: './file.md' }
  //   await wrapper.vm.diff(file)

  //   expect(store.dispatch).toHaveBeenCalledTimes(1)
  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/diff')
  //   expect(store.dispatch.mock.calls[0][1]).toEqual({ path: file.path })

  //   expect(event).toHaveBeenCalledTimes(1)
  // })

  // it('should dispatch stage for path on call to stage', async () => {
  //   const wrapper = factory.wrap()

  //   const path = './file.md'
  //   await wrapper.vm.stage(path)

  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/stage')
  //   expect(store.dispatch.mock.calls[0][1]).toBe(path)
  // })

  // it('should dispatch reset for path on call to reset', async () => {
  //   const wrapper = factory.wrap()

  //   const path = './file.md'
  //   await wrapper.vm.reset(path)

  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/reset')
  //   expect(store.dispatch.mock.calls[0][1]).toBe(path)
  // })

  // it('should store the prepared message on call to update_message', async () => {
  //   const wrapper = factory.wrap()

  //   const message = 'New Message'
  //   await wrapper.vm.update_message(message)

  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/message')
  //   expect(store.dispatch.mock.calls[0][1]).toBe(message)
  // })

  // it('should dispatch commit with details on call to commit', async () => {
  //   const wrapper = factory.wrap()

  //   const event = jest.fn()

  //   wrapper.vm.$on('close', event)

  //   const name = 'Test Name'
  //   const email = 'test@example.com'
  //   const message = 'Test Message'

  //   wrapper.setData({
  //     input: { name, email, message }
  //   })

  //   expect(event).toHaveBeenCalledTimes(0)

  //   await wrapper.vm.commit()

  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/commit')

  //   expect(event).toHaveBeenCalledTimes(1)
  // })

  // it('should not emit a push event when auto-push is disabled on call to commit', async () => {
  //   const wrapper = factory.wrap()

  //   const event = jest.fn()

  //   wrapper.vm.$on('push', event)

  //   const name = 'Test Name'
  //   const email = 'test@example.com'
  //   const message = 'Test Message'

  //   store.state.configuration.auto_push = false

  //   expect(store.state.configuration.auto_push).toBeFalsy()

  //   wrapper.setData({
  //     input: { name, email, message }
  //   })

  //   expect(event).toHaveBeenCalledTimes(0)

  //   await wrapper.vm.commit()

  //   expect(store.dispatch.mock.calls[0][0]).toBe('tome/commit')

  //   expect(event).toHaveBeenCalledTimes(0)
  // })

  // it('should emit a push event when auto-push is configured on call to commit', async () => {
  //   const wrapper = factory.wrap()

  //   const event = jest.fn()

  //   wrapper.vm.$on('push', event)

  //   const name = 'Test Name'
  //   const email = 'test@example.com'
  //   const message = 'Test Message'

  //   store.state.configuration.auto_push = true

  //   expect(store.state.configuration.auto_push).toBeTruthy()

  //   await wrapper.setData({
  //     input: { name, email, message }
  //   })
  //   await wrapper.setProps({ confirm: true })
  //   await wrapper.vm.$nextTick()

  //   expect(event).toHaveBeenCalledTimes(0)

  //   await wrapper.vm.commit()
  //   await wrapper.vm.$nextTick()

  //   expect(event).toHaveBeenCalledTimes(1)
  // })

  // it('should auto-populate message for commit when confirm opened and message is blank', async () => {
  //   const wrapper = factory.wrap({
  //     value: true,
  //     commit: false
  //   })

  //   expect(store.state.tome.message).toBe('')

  //   await wrapper.setProps({ confirm: true })
  //   await wrapper.vm.$nextTick()

  //   expect(store.dispatch.mock.calls[1][0]).toBe('tome/message')
  // })

  // it('should disable post-commit push when confirm is opened and auto-push is disabled', async () => {
  //   const wrapper = factory.wrap({
  //     value: true,
  //     commit: false
  //   })

  //   store.state.configuration.auto_push = false

  //   expect(store.state.configuration.auto_push).toBeFalsy()

  //   await wrapper.setProps({ confirm: true })
  //   await wrapper.vm.$nextTick()

  //   expect(wrapper.vm.push).toBeFalsy()
  // })

  // it('should enable post-commit push when confirm is opened and auto-push is enabled', async () => {
  //   const wrapper = factory.wrap({
  //     value: true,
  //     commit: false
  //   })

  //   store.state.configuration.auto_push = true

  //   expect(store.state.configuration.auto_push).toBeTruthy()

  //   await wrapper.setProps({ confirm: true })
  //   await wrapper.vm.$nextTick()

  //   expect(wrapper.vm.push).toBeTruthy()
  // })

  it('should dispatch system/signature/name with new value when sign_name is called with a value', async () => {
    const wrapper = factory.wrap()

    const name = 'John Doe'
    await wrapper.vm.sign_name(name)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/name')

    expect(action).toBeDefined()
    expect(data).toEqual(name)
  })

  it('should dispatch system/signature/email with new value when sign_email is called with a value', async () => {
    const wrapper = factory.wrap()

    const email = 'test@example.com'
    await wrapper.vm.sign_email(email)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/email')

    expect(action).toBeDefined()
    expect(data).toEqual(email)
  })

  it('should dispatch system/signature/message with new value when sign_message is called with a value', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.sign_message(message)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/signature/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch system/commit with false when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should dispatch system/commit_confirm with new value when confirm is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.confirm(true)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit_confirm')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/commit_push with new value when push is called with a value', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.push(true)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit_push')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch tome/message with message when message is called with message', async () => {
    const wrapper = factory.wrap()

    const message = 'Test Message'
    await wrapper.vm.message(message)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'tome/message')

    expect(action).toBeDefined()
    expect(data).toEqual(message)
  })

  it('should dispatch tome/diff with path when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const file = {
      path: './file.md'
    }

    await wrapper.vm.diff(file)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'tome/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: file.path })
  })

  it('should dispatch system/patch with true when diff is called with file', async () => {
    const wrapper = factory.wrap()

    const file = {
      path: './file.md'
    }

    await wrapper.vm.diff(file)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/patch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch tome/stage with path when stage is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'tome/stage')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch tome/reset with path when reset is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'tome/reset')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should dispatch system/perform for commit when commit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual('commit')
  })
})
