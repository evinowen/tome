import NodeGit from 'nodegit'
import Vue from 'vue'
import Vuetify from 'vuetify'

import PushView from '@/views/Push.vue'

import store from '@/store'

Vue.use(Vuetify)

jest.mock('nodegit', () => ({ Remote: {} }))
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

const remote_commit  = {
  id: () => _id,
  message: jest.fn(),
  parentcount: jest.fn(() => 1),
  parent: jest.fn(() => ({}))
}

const reference_list = [
  { name: jest.fn(() => 'refs/heads/master'), oid: () => _id }
]

const repository_remotes = [
  {
    name: jest.fn(() => 'origin'),
    url: jest.fn(() => 'git@git.server:test/test.git'),
    oid: () => _id,
    connect: jest.fn((direction, callbacks) => 0),
    referenceList: jest.fn(() => reference_list),
    push: jest.fn()
  }
]

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

NodeGit.Enums = {
  DIRECTION: {
    FETCH: 1
  }
}

NodeGit.Remote = {
  create: jest.fn((repository, name, url) => repository_remotes[0]),
}

describe('Push.vue', () => {
  let vuetify
  let wrapper

  const prepare = () => {
    vuetify = new Vuetify()

    return { context: { vuetify, stubs: { VDataTable: true } } }
  }

  const wrap = factory(PushView, prepare, {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    wrapper = wrap({})

    expect(wrapper).not.toBeNull()
  })

  it('assign the selected private key when selected in the file dialog', async () => {
    wrapper = wrap({})

    expect(wrapper.vm.input.private_key.value).toBe('key')

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: '/private/key/path' }))

    await wrapper.find({ ref: 'private_key' }).trigger('change')

    expect(wrapper.vm.input.private_key.value).toBe('/private/key/path')
  })

  it('assign the selected public key when selected in the file dialog', async () => {
    wrapper = wrap({})

    expect(wrapper.vm.input.public_key.value).toBe('key.pub')

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: '/public/key/path' }))

    await wrapper.find({ ref: 'public_key' }).trigger('change')

    expect(wrapper.vm.input.public_key.value).toBe('/public/key/path')
  })

  it('create a remote and reload remotes when add remote form is submited', async () => {
    wrapper = wrap({})

    expect(NodeGit.Remote.create).toHaveBeenCalledTimes(0)

    wrapper.vm.input.remotes.input.name = "new_remote"
    wrapper.vm.input.remotes.input.url = "git@git.server:test/test2.git"

    await wrapper.find({ ref: 'add_remote' }).trigger('click')

    expect(NodeGit.Remote.create).toHaveBeenCalledTimes(1)
  })

  it('set and load the remote chosen from the remote list', async () => {
    wrapper = wrap({})
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.input.remotes.selected).toBeNull()

    wrapper.vm.$refs.remote_select.selectItem(wrapper.vm.input.remotes.list[0])
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.input.remotes.selected).toBe(wrapper.vm.input.remotes.list[0])

  })

  it('prevent push if no remote selected when the push is confirmed', async () => {
    wrapper = wrap({})

    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'push_confirm' }).trigger('click')

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)
  })

  it('push pending commits when the push is confirmed', async () => {
    wrapper = wrap({})

    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    wrapper.vm.$refs.remote_select.selectItem(wrapper.vm.input.remotes.list[0])
    await wrapper.vm.$nextTick()

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'push_confirm' }).trigger('click')

    expect(repository_remotes[0].push).toHaveBeenCalledTimes(1)
  })
})
