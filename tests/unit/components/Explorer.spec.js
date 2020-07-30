import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote, shell } from 'electron'
import { v4 as uuidv4 } from 'uuid'
// import store from '@/store'

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
        expanded: false,
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
        expanded: false,
      },
      {
        uuid: uuidv4(),
        name: 'file.md',
        path: '/project/file.md',
        directory: false,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      },
      {
        uuid: uuidv4(),
        name: 'second',
        path: '/project/second',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const value = { create: jest.fn(), parent: { remove_item: jest.fn(() => ({ path: '/item.path' })) } }
  const hold = {
    context: {
      path: '/project/second',
    }
  }

  const base = {
    uuid: uuidv4(),
    name: 'project',
    path: '/project',
    root: true,
    directory: true,
    expanded: false,
    children: [],
    templates: [],
    actions: [],
  }

  const children = []

  const populate = jest.fn(item => {
    switch (item.path) {
      case '/project':
        item.children.length = 0
        item.children.push(...children)
        return

      case '/project/first':
        return

      case '/project/second':
        return

      case '/project/third':
        return
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

  it('should flip edit flag to true when create method is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.editing).toBe(false)

    await wrapper.vm.create({ target: '/project/third', directory: false })

    expect(wrapper.vm.editing).toBe(true)
  })

  it('emit a delete event with a reject/resolve callback when delete is called for item in tree', async () => {
    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve()
    })

    const wrapper = factory.wrap({ expanded: true }, { delete: event })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.emitted().delete).toBeUndefined()

    await wrapper.vm.delete('/project/third')

    expect(wrapper.emitted().delete.length).toBe(1)
  })

  it('should fail gracefully on delete when reject action is called', async () => {
    const event = jest.fn(async (state) => {
      const { reject } = state
      await reject(new Error('error!'))
    })

    const wrapper = factory.wrap({ expanded: true }, { delete: event })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.emitted().delete).toBeUndefined()

    await wrapper.vm.delete('/project/third')

    expect(wrapper.emitted().delete.length).toBe(1)
  })

  it('flip edit flag to false when blur event is triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.setData({ editing: true })
    expect(wrapper.vm.editing).toBe(true)

    await wrapper.vm.$refs.explorer_root.$emit('blur', { context: { emphemeral: false } })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.editing).toBe(false)
  })

  it('instruct parent to destory emphemeral children when blur event is triggered', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ editing: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      ephemeral: true,
      parent: {
      }
    }

    await wrapper.vm.$refs.explorer_root.$emit('blur', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
  })

  it('emit move event with interactions when drop event is triggered for a file and resolve properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '',
      directory: false
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { resolve } = context
      await resolve({
        previous: { path: from_path, parent: '/project' },
        current: { path: to_path, parent: '/project/third' }
      })
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a file and reject properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      directory: false
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { reject } = context
      await reject('whoops!')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a folder and resolve properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      directory: true,
      expanded: true
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { resolve } = context
      await resolve({
        previous: { path: from_path, parent: '/project' },
        current: { path: to_path, parent: '/project' }
      })
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a folder and reject properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '',
      directory: true,
      expanded: false,
      $emit: jest.fn()
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { reject } = context
      await reject('whoops!')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('attempt to rename a directory object when the field is normal', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/project/third',
      input: 'Third Path Item',
      title: true
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve({
        previous: { path: '/project/third', parent: '/project' },
        current:  { path: '/project/third.path.item', parent: '/project' },
      })
    })

    wrapper.vm.$on('rename', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('attempt to rename a file object when the field is normal', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/project/file.md',
      input: 'File Test',
      title: true
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve({
        previous: { path: '/project/file.md', parent: '/project' },
        current:  { path: '/project/file.test.md', parent: '/project' },
      })
    })

    wrapper.vm.$on('rename', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should fail gracefully when a rename is not successful', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/project/file.md',
      input: 'File Test',
      title: true
    }

    const event = jest.fn(async (state) => {
      const { reject } = state
      await reject(new Error('error!'))
    })

    wrapper.vm.$on('rename', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('attempt to create a file object when the field is ephemeral', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/project/ephemeral.md',
      input: 'Ephemeral',
      title: true
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve({
        previous: { path: '/project/file.md', parent: '/project' },
        current:  { path: '/project/file.test.md', parent: '/project' },
      })
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
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

  it('should expand an item when toggle is called for it', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(children[2].expanded).toBe(false)

    await wrapper.vm.toggle({ path: '/project/third' })

    expect(children[2].expanded).toBe(true)
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

  it('should return null for paths not participating in the current file structure', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.identify('/pragencto/third')).toBeNull()
  })
})
