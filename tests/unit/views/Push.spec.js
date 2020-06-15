import { assemble } from 'tests/helpers'
import NodeGit from 'nodegit'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import PushView from '@/views/Push.vue'

Vue.use(Vuetify)

jest.mock('nodegit', () => ({ Enums: {}, Remote: {}, Cred: {} }))
jest.mock('@/store', () => ({ state: {} }))

const _id = {
  tostrS: jest.fn(() => 1),
  cmp: jest.fn(() => 0)
}

const local_commit = {
  id: () => _id,
  message: jest.fn(),
  parentcount: jest.fn(() => 1),
  parent: jest.fn(() => ({}))
}

const remote_commit = {
  id: () => _id,
  message: jest.fn(),
  parentcount: jest.fn(() => 1),
  parent: jest.fn(() => ({}))
}

const reference_list = [
  { name: jest.fn(() => 'refs/tags/v1'), oid: () => _id },
  { name: jest.fn(() => 'refs/tags/v2'), oid: () => _id },
  { name: jest.fn(() => 'refs/tags/v3'), oid: () => _id },
  { name: jest.fn(() => 'refs/heads/develop'), oid: () => _id },
  { name: jest.fn(() => 'refs/heads/stage'), oid: () => _id },
  { name: jest.fn(() => 'refs/heads/master'), oid: () => _id }
]

const repository_remotes = [
  {
    name: jest.fn(() => 'origin'),
    url: jest.fn(() => 'git@git.server:test/test.git'),
    oid: () => _id,
    connect: jest.fn((direction, callbacks) => 0),
    referenceList: jest.fn(() => reference_list),
    push: jest.fn((_, options) => {
      if (options && options.callbacks) {
        if (options.callbacks.credentials) {
          options.callbacks.credentials()
        }

        if (options.callbacks.certificateCheck) {
          options.callbacks.certificateCheck()
        }
      }
    })
  }
]

NodeGit.Enums = {
  DIRECTION: {
    FETCH: 1
  }
}

NodeGit.Remote = {
  create: jest.fn((repository, name, url) => repository_remotes[0])
}

NodeGit.Cred = {
  sshKeyNew: jest.fn()
}

describe('Push.vue', () => {
  let vuetify

  const factory = assemble(PushView)
    .context(() => ({ stubs: { VDataTable: true } }))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)

      vuetify = new Vuetify()
      context.vuetify = vuetify
    })

  beforeEach(() => {
    store.state = {
      tome: {
        repository: {
          getRemotes: jest.fn(() => Promise.resolve(repository_remotes)),
          getReferences: jest.fn(() => reference_list),
          getReferenceCommit: jest.fn(() => local_commit),
          getCommit: jest.fn(() => remote_commit)
        },
        branch: {
          name: 'master'
        }
      },
      configuration: {
        private_key: 'key',
        public_key: 'key.pub',
        passphrase: 'passphrase'
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })

  it('is able to be mocked and prepared for testing with a blank configuration', () => {
    store.state.configuration = {}

    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })

  it('assign the selected private key when selected in the file dialog', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.input.private_key.value).toBe('key')

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: '/private/key/path' }))

    await wrapper.find({ ref: 'private_key' }).trigger('change')

    expect(wrapper.vm.input.private_key.value).toBe('/private/key/path')
  })

  it('not overwrite the private key when selected key in the file dialog returns no path', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.input.private_key.value).toBe('key')

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: null }))

    await wrapper.find({ ref: 'private_key' }).trigger('change')

    expect(wrapper.vm.input.private_key.value).toBe('key')
  })

  it('assign the selected public key when selected in the file dialog', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.input.public_key.value).toBe('key.pub')

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: '/public/key/path' }))

    await wrapper.find({ ref: 'public_key' }).trigger('change')

    expect(wrapper.vm.input.public_key.value).toBe('/public/key/path')
  })

  it('create a remote and reload remotes when add remote form is submited', async () => {
    const wrapper = factory.wrap()

    expect(NodeGit.Remote.create).toHaveBeenCalledTimes(0)

    wrapper.vm.input.remotes.input.name = 'new_remote'
    wrapper.vm.input.remotes.input.url = 'git@git.server:test/test2.git'

    await wrapper.find({ ref: 'add_remote' }).trigger('click')

    expect(NodeGit.Remote.create).toHaveBeenCalledTimes(1)
  })

  it('set and load the remote chosen from the remote list', async () => {
    _id.cmp.mockImplementationOnce(() => 1)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input.remotes.selected).toBeNull()
    expect(wrapper.vm.input.branch.error).toBeNull()

    wrapper.vm.$refs.remote_select.selectItem(wrapper.vm.input.remotes.list[0])
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input.remotes.selected).toBe(wrapper.vm.input.remotes.list[0])
  })

  it('throw error when a remote chosen from the remote list is detached', async () => {
    _id.cmp.mockImplementationOnce(() => 1)
    local_commit.parentcount.mockImplementationOnce(() => 0)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input.remotes.selected).toBeNull()
    expect(wrapper.vm.input.branch.error).toBeNull()

    wrapper.vm.$refs.remote_select.selectItem(wrapper.vm.input.remotes.list[0])
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.input.remotes.selected).toBe(wrapper.vm.input.remotes.list[0])
  })

  it('prevent push if no remote selected when the push is confirmed', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.confirm = true
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'push_confirm' }).trigger('click')

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)
  })

  it('push pending commits when the push is confirmed', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.confirm = true
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.remote_select.selectItem(wrapper.vm.input.remotes.list[0])
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'push_confirm' }).trigger('click')

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(1)
  })
})
