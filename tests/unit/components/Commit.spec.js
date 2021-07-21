import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import Commit from '@/components/Commit.vue'

Vue.use(Vuetify)

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

const _id = {
  tostrS: jest.fn(() => 1),
  cmp: jest.fn(() => 0)
}

const index = {
  addByPath: jest.fn(() => 0),
  write: jest.fn(() => 0),
  writeTree: jest.fn(() => _id)
}

const commit = {}

store.state = {
  tome: {
    status: {
      staged: [],
      available: []
    }
  },
  configuration: {
    private_key: './id_rsa',
    public_key: './id_rsa.pub',
    passphrase: '1234'
  }
}

describe('Commit.vue', () => {
  let vuetify

  const factory = assemble(Commit)
    .context(() => ({ stubs: {
      CommitList: true,
      CommitConfirm: true,
      VDataTable: true
    } }))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)

      vuetify = new Vuetify()
      context.vuetify = vuetify
    })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

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
    expect(store.dispatch.mock.calls[0][1]).toEqual({ name, email, message })

    expect(event).toHaveBeenCalledTimes(1)
  })
})
