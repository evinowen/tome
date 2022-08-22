import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import { shell } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import store from '@/store'

import Explorer from '@/components/Explorer.vue'
import { ExplorerNodeGhostType } from '@/components/ExplorerNode.vue'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

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
      tree: {
        base: {
          expanded: false,
          children: []
        }
      }
    }
  },
  dispatch: jest.fn()
}))

jest.mock('electron', () => ({
  shell: {
    openPath: jest.fn()
  }
}))

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

  const factory = assemble(Explorer, { value, enabled: true }, { populate, stub: { VIcon: true } }).context(() => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })

  it('store drag state when dragging begins in hold', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(wrapper.vm.hold).toBeNull()

    await wrapper.vm.$refs.explorer_root.$emit('drag', hold)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.hold).toBe(hold)
  })

  it('should dispatch file edit action for path when edit event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.edit({ target: '/project/first' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/edit')
  })

  it('should dispatch file delete action for path when delete event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.delete('/project/third')

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/delete')
  })

  it('should dispatch file blur action when blur event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.blur()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/blur')
  })

  it('should dispatch file move action when drop is triggered for a node', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

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
    store.dispatch.mockClear()

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

  it('should throw an exception when no named is passed to format', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(() => wrapper.vm.format()).toThrow(Error)
  })

  it('should throw an exception when a bad folder name is passed to format', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(() => wrapper.vm.format(null, true)).toThrow(Error)
  })

  it('should throw an exception for files that have incorrect extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(() => wrapper.vm.format('file.name.txt')).toThrow(Error)
  })

  it('should throw an exception for items formatted that are titled with invalid symbols', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(() => wrapper.vm.format('FILE-%%%%')).toThrow(Error)
  })

  it('should return formatted title for files formatted that have correct extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    const formated = wrapper.vm.format('file.name.md')

    expect(formated).toBe('File Name')
  })

  it('should call store file toggle action for item path provided by toggle event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.toggle({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/toggle')
  })

  it('should call store file select action for item path provided by select event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.select({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/select')
  })

  it('should call store file populate action for item path provided by populate event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.populate({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/populate')
  })

  it('should call store file ghost action for item path provided by create event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.create({ target: '/project/third', type: ExplorerNodeGhostType.FILE })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/ghost')
  })

  it('should attempt to open target file of open method call', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(shell.openPath).toHaveBeenCalledTimes(0)

    await wrapper.vm.open({ path: '/project/third' })

    expect(shell.openPath).toHaveBeenCalledTimes(1)
  })

  it('should attempt to open directory of file of open method call when parent flag is true', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(shell.openPath).toHaveBeenCalledTimes(0)
    expect(window.api.path_dirname).toHaveBeenCalledTimes(0)

    await wrapper.vm.open({ path: '/project/third', parent: true })

    expect(shell.openPath).toHaveBeenCalledTimes(1)
    expect(window.api.path_dirname).toHaveBeenCalledTimes(1)
  })

  it('should instruct the template service to execute when template is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await wrapper.vm.template(state)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('templates/execute')
    expect(store.dispatch.mock.calls[0][1]).toBe(state)
  })

  it('should instruct the action service to execute when action is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await wrapper.vm.action(state)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('actions/execute')
    expect(store.dispatch.mock.calls[0][1]).toBe(state)
  })
})
