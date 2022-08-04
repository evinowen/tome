import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import Commit from '@/components/Commit.vue'

Vue.use(Vuetify)

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('Commit.vue', () => {
  let vuetify

  const factory = assemble(Commit)
    .context(() => ({
      stubs: {
        CommitList: true,
        CommitConfirm: true,
        VDataTable: true
      }
    }))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)

      vuetify = new Vuetify()
      context.vuetify = vuetify
    })

  beforeEach(() => {
    store.state = {
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

  it('is able to be mocked and prepared for testing', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper).not.toBeNull()
  })

  it('should load file diff and emit patch event on call to diff', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    const file = { path: './file.md' }
    await wrapper.vm.diff(file)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('tome/diff')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ path: file.path })

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should dispatch stage for path on call to stage', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.stage(path)

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/stage')
    expect(store.dispatch.mock.calls[0][1]).toBe(path)
  })

  it('should dispatch reset for path on call to reset', async () => {
    const wrapper = factory.wrap()

    const path = './file.md'
    await wrapper.vm.reset(path)

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/reset')
    expect(store.dispatch.mock.calls[0][1]).toBe(path)
  })

  it('should store the prepared message on call to update_message', async () => {
    const wrapper = factory.wrap()

    const message = 'New Message'
    await wrapper.vm.update_message(message)

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/message')
    expect(store.dispatch.mock.calls[0][1]).toBe(message)
  })

  it('should dispatch commit with details on call to commit', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('close', event)

    const name = 'Test Name'
    const email = 'test@example.com'
    const message = 'Test Message'

    wrapper.setData({
      input: { name, email, message }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.commit()

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/commit')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should not emit a push event when auto-push is disabled on call to commit', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('push', event)

    const name = 'Test Name'
    const email = 'test@example.com'
    const message = 'Test Message'

    store.state.configuration.auto_push = false

    expect(store.state.configuration.auto_push).toBeFalsy()

    wrapper.setData({
      input: { name, email, message }
    })

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.commit()

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/commit')

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should emit a push event when auto-push is configured on call to commit', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('push', event)

    const name = 'Test Name'
    const email = 'test@example.com'
    const message = 'Test Message'

    store.state.configuration.auto_push = true

    expect(store.state.configuration.auto_push).toBeTruthy()

    await wrapper.setData({
      input: { name, email, message }
    })
    await wrapper.setProps({ confirm: true })
    await wrapper.vm.$nextTick()

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.commit()
    await wrapper.vm.$nextTick()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should auto-populate message for commit when confirm opened and message is blank', async () => {
    const wrapper = factory.wrap({
      value: true,
      commit: false
    })

    expect(store.state.tome.message).toBe('')

    await wrapper.setProps({ confirm: true })
    await wrapper.vm.$nextTick()

    expect(store.dispatch.mock.calls[1][0]).toBe('tome/message')
  })

  it('should disable post-commit push when confirm is opened and auto-push is disabled', async () => {
    const wrapper = factory.wrap({
      value: true,
      commit: false
    })

    store.state.configuration.auto_push = false

    expect(store.state.configuration.auto_push).toBeFalsy()

    await wrapper.setProps({ confirm: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.push).toBeFalsy()
  })

  it('should enable post-commit push when confirm is opened and auto-push is enabled', async () => {
    const wrapper = factory.wrap({
      value: true,
      commit: false
    })

    store.state.configuration.auto_push = true

    expect(store.state.configuration.auto_push).toBeTruthy()

    await wrapper.setProps({ confirm: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.push).toBeTruthy()
  })
})
