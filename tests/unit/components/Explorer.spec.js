import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote, shell } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import store from '@/store'

import Explorer from '@/components/Explorer.vue'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {
    tome: {
      name: 'project',
      path: '/project'
    },
    configuration: {
      format_titles: false
    },
    files: {
      active: null,
      content: null,
      error: null,
      tree: {}
    }
  },
  dispatch: jest.fn()
}))

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  },
  shell: {
    openItem: jest.fn()
  }
}))

const fs = {
  open: jest.fn(),
  close: jest.fn(),
  mkdir: jest.fn()
}

const path = {
  dirname: jest.fn(),
  join: jest.fn(),
  relative: jest.fn((first, second) => {
    switch (second) {
      case '/project': return ''
      case '/project/first': return 'first'
      case '/project/second': return 'second'
      case '/project/third': return 'third'
      case '/project/file.md': return 'file.md'
      case '/project/ephemeral.md': return 'ephemeral.md'
    }
  })
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

describe('Explorer.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()

    children.length = 0
    children.push(
      {
        uuid: uuidv4(),
        name: 'first',
        path: '/project/first',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false
      },
      {
        uuid: uuidv4(),
        name: 'ephemeral.md',
        path: '/project/ephemeral.md',
        directory: false,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
        ephemeral: true
      },
      {
        uuid: uuidv4(),
        name: 'third',
        path: '/project/third',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false
      },
      {
        uuid: uuidv4(),
        name: 'file.md',
        path: '/project/file.md',
        directory: false,
        children: [],
        templates: [],
        actions: [],
        expanded: false
      },
      {
        uuid: uuidv4(),
        name: 'second',
        path: '/project/second',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const value = { create: jest.fn(), parent: { remove_item: jest.fn(() => ({ path: '/item.path' })) } }
  const hold = {
    context: {
      path: '/project/second'
    }
  }

  const children = []

  const populate = jest.fn(item => {
    switch (item.path) {
      case '/project':
        item.children.length = 0
        item.children.push(...children)
        break

      case '/project/first':
        break

      case '/project/second':
        break

      case '/project/third':
        break
    }
  })

  const factory = assemble(Explorer, { value, enabled: true }, { populate }).context(() => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })

  it('store drag state when dragging begins in hold', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.hold).toBeNull()

    await wrapper.vm.$refs.explorer_root.$emit('drag', hold)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.hold).toBe(hold)
  })

  it('flip edit flag to true when edit method is called', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.editing).toBe(false)

    await wrapper.vm.edit()

    expect(wrapper.vm.editing).toBe(true)
  })

  it('should dispatch file delete action for path when delete event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.delete('/project/third')

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/delete')
  })

  it('flip edit flag to false when blur event is triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.setData({ editing: true })
    expect(wrapper.vm.editing).toBe(true)

    await wrapper.vm.$refs.explorer_root.$emit('blur')
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.editing).toBe(false)
  })

  it('should dispatch file move action when drop is triggered for a node', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      directory: false
    }

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/move')
  })

  it('should dispatch file submit action when submit is triggered for a node', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const context = {
      path: '/project/file.md',
      input: 'file.change.md',
      title: false
    }

    await wrapper.vm.$refs.explorer_root.$emit('submit', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/submit')
  })

  it('should fail gracefully when a bad file name is passed to format', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format()

    expect(formated).toBe(' - ')
  })

  it('should fail gracefully when a bad folder name is passed to format', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format(null, true)

    expect(formated).toBe('')
  })

  it('should return placeholder title for files formatted that have incorrect extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format('file.name.txt')

    expect(formated).toBe(' - ')
  })

  it('should return formatted title for files formatted that have correct extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format('file.name.md')

    expect(formated).toBe('File Name')
  })

  it('should call store file toggle action for item path provided by toggle event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.toggle({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/toggle')
  })

  it('should call store file select action for item path provided by select event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.select({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/select')
  })

  it('should call store file populate action for item path provided by populate event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.populate({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/populate')
  })

  it('should call store file ghost action for item path provided by create event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.create({ target: '/project/third', directory: false })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/ghost')
  })

  it('should attempt to open target file of open method call', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(shell.openItem).toHaveBeenCalledTimes(0)

    await wrapper.vm.open({ path: '/project/third' })

    expect(shell.openItem).toHaveBeenCalledTimes(1)
  })

  it('should attempt to open directory of file of open method call when parent flag is true', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(shell.openItem).toHaveBeenCalledTimes(0)
    expect(path.dirname).toHaveBeenCalledTimes(0)

    await wrapper.vm.open({ path: '/project/third', parent: true })

    expect(shell.openItem).toHaveBeenCalledTimes(1)
    expect(path.dirname).toHaveBeenCalledTimes(1)
  })
})
