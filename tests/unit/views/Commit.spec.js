import NodeGit from 'nodegit'
import Vue from 'vue'
import Vuetify from 'vuetify'

import CommitView from '@/views/Commit.vue'

import store from '@/store'

Vue.use(Vuetify)

jest.mock('nodegit', () => ({ Reset: {}, Reference: {}, Signature: {} }))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

const _id = {
  tostrS: jest.fn(() => 1),
  cmp: jest.fn(() => 0)
}

const index = {
  addByPath: jest.fn(() => _id),
  write: jest.fn(() => 0),
  writeTree: jest.fn(() => _id)
}

const commit = {}

store.state = {
  tome: {
    repository: {
      getCommit: jest.fn(() => commit),
      getBranchCommit: jest.fn(() => commit),
      head: jest.fn(() => null),
      createCommit: jest.fn(() => ({})),
      refreshIndex: jest.fn(() => index),
      headUnborn: jest.fn(() => false),
    },
    status: {
      staged: {
        new: 0,
        renamed: 0,
        modified: 2,
        deleted: 0,
        items: [ { path: '/1234' }, { path: '/5678' } ]
      },
      available: {
        new: 2,
        renamed: 0,
        modified: 0,
        deleted: 0,
        items: [ { path: '/abcd' }, { path: '/efgh' } ]
      }
    }
  },
  configuration: {
    private_key: 'key',
    public_key: 'key.pub',
    passphrase: 'passphrase'
  }
}

NodeGit.Reset = {
  default: jest.fn()
}

NodeGit.Reference = {
  nameToId: jest.fn()
}

NodeGit.Signature = {
  now: jest.fn()
}

describe('Commit.vue', () => {
  let vuetify
  let wrapper

  const prepare = () => {
    vuetify = new Vuetify()

    return { context: { vuetify, stubs: { VDataTable: true } } }
  }

  const wrap = factory(CommitView, prepare, {})

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    wrapper = wrap({})

    expect(wrapper).not.toBeNull()
  })

  it('stage all available changes when the stage all button is clicked', async () => {
    wrapper = wrap({})
    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    const length = store.state.tome.status.staged.items.length

    expect(index.addByPath).toHaveBeenCalledTimes(0)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
    await wrapper.find({ ref: 'stage' }).trigger('click')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(index.addByPath).toHaveBeenCalledTimes(length)
    expect(store.dispatch).toHaveBeenCalledTimes(1)
  })

  it('staged all but abort if index cannot be written when the stage all button is clicked', async () => {
    wrapper = wrap({})
    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    const length = store.state.tome.status.staged.items.length
    index.write.mockReturnValueOnce(1)

    expect(index.addByPath).toHaveBeenCalledTimes(0)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
    await wrapper.find({ ref: 'stage' }).trigger('click')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(index.addByPath).toHaveBeenCalledTimes(length)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
  })

  it('reset all staged changes when the reset all button is clicked', async () => {
    wrapper = wrap({})
    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    const length = store.state.tome.status.staged.items.length

    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(0)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
    await wrapper.find({ ref: 'reset' }).trigger('click')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(length)
    expect(store.dispatch).toHaveBeenCalledTimes(1)
  })

  it('reset all but abort if index cannot be written when the reset all button is clicked', async () => {
    wrapper = wrap({})
    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    const length = store.state.tome.status.staged.items.length
    index.write.mockReturnValueOnce(1)

    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(0)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
    await wrapper.find({ ref: 'reset' }).trigger('click')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(NodeGit.Reset.default).toHaveBeenCalledTimes(length)
    expect(store.dispatch).toHaveBeenCalledTimes(0)
  })


  it('create a remote and reload remotes when add remote form is submited', async () => {
    wrapper = wrap({})
    wrapper.vm.confirm = true
    await wrapper.vm.$nextTick()

    expect(store.state.tome.repository.createCommit).toHaveBeenCalledTimes(0)
    await wrapper.find({ ref: 'commit' }).trigger('click')

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(store.state.tome.repository.createCommit).toHaveBeenCalledTimes(1)
  })
})
