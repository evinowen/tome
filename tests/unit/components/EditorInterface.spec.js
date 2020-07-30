import { assemble } from '@/../tests/helpers'
import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import SplitPane from 'vue-splitpane'
import EditorInterface from '@/components/EditorInterface.vue'

Vue.use(Vuetify)
Vue.component('split-pane', SplitPane)

jest.mock('nodegit', () => ({}))
jest.mock('electron', () => ({ remote: {} }))
jest.mock('@/store', () => ({ state: {} }))

const _lstat = {
  status: {
    isDirectory: jest.fn(() => false)
  }
}

const children = [
  {
    name: '.git',
    isDirectory: jest.fn(() => true)
  },
  {
    name: 'abc',
    isDirectory: jest.fn(() => true)
  },
  {
    name: 'def',
    isDirectory: jest.fn(() => true)
  },
  {
    name: 'test.md',
    isDirectory: jest.fn(() => false)
  },
  {
    name: 'test.gif',
    isDirectory: jest.fn(() => false)
  },
  {
    name: 'test.jpg',
    isDirectory: jest.fn(() => false)
  },
  {
    name: 'test.jpeg',
    isDirectory: jest.fn(() => false)
  },
  {
    name: 'test.png',
    isDirectory: jest.fn(() => false)
  },
  {
    name: 'test.txt',
    isDirectory: jest.fn(() => false)
  }
]

const fs = {
  access: jest.fn((path, callback) => callback(null)),
  open: jest.fn((path, flags, callback) => callback(null, 1)),
  close: jest.fn((handler, callback) => callback(null)),
  mkdir: jest.fn((path, options, callback) => (!callback ? options : callback)(0, children)),
  writeFile: jest.fn((path, content, callback) => callback(null)),
  readdir: jest.fn((handler, options, callback) => (!callback ? options : callback)(0, children)),
  lstat: jest.fn((handler, callback) => callback(null, _lstat.status)),
  unlink: jest.fn((handler, callback) => callback(null, 1)),
  rename: jest.fn((path, proposed, callback) => callback(null)),
  readFileSync: jest.fn(() => '# Placeholder Content'),
  writeFileSync: jest.fn()
}

const path = {
  join: jest.fn(() => '/joined/path'),
  relative: jest.fn(),
  isAbsolute: jest.fn(),
  basename: jest.fn(),
  dirname: jest.fn(() => '/abc123'),
  extname: jest.fn(path => String(path).substr(path.lastIndexOf('.')))
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

describe('EditorInterface.vue', () => {
  let vuetify

  beforeEach(() => {
    store.state = {
      tome: {
        name: 'TestTome',
        path: '/abc/123/xyz/tmp'
      }
    }

    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(EditorInterface, {
    edit: false,
    commit: false,
    push: false
  })
    .context(() => (
      {
        vuetify,
        stubs: {
          ActionView: true,
          CommitView: true,
          EmptyView: true,
          PushView: true,
          Explorer: true,
          Codemirror: true
        }
      }
    ))

  it('should render empty view if not editing and no file is loaded', async () => {
    store.state.tome.name = null
    store.state.tome.path = null

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.find({ ref: 'empty_unloaded' }).exists()).toBe(true)
  })

  it('should load the children of a provided item with children when triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const item = {
      directory: true,
      path: '/abc123',
      children: []
    }

    expect(item.children.length).toBe(0)

    await wrapper.vm.populate(item)

    expect(item.children.length).toBe(children.length)
  })

  it('should not load the children of a non-directory file when triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const item = {
      directory: false,
      path: '/abc123',
      children: []
    }

    expect(item.children.length).toBe(0)

    await wrapper.vm.populate(item)

    expect(item.children.length).toBe(0)
  })

  it('should load content of a provided item with children when triggered for file', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const selected = {
      path: '/path/to/selected.md'
    }

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.load_file(selected)

    expect(wrapper.vm.content).not.toBe('')
    expect(wrapper.vm.error).toBe('')
  })

  it('should load the currently selected item when select file is called', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ selected: { path: '/path/to/selected.md' }})
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.select_file()

    expect(wrapper.vm.content).not.toBe('')
    expect(wrapper.vm.error).toBe('')
  })

  it('should fail to load content without a target when triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.load_file()

    expect(wrapper.vm.content).toBe('')
  })

  it('should fail to load content of an item without a path when triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const selected = { }

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.load_file(selected)

    expect(wrapper.vm.content).toBe('')
  })

  it('should fail to load content of a provided item with children when triggered for file with the wrong extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const selected = {
      path: '/path/to/selected.doc'
    }

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.load_file(selected)

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).not.toBe('')
  })

  it('should fail to load content of a provided item with children when triggered for folder', async () => {
    _lstat.status.isDirectory.mockReturnValueOnce(true)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const selected = {
      path: '/path/to/selected.md'
    }

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).toBe('')

    await wrapper.vm.load_file(selected)

    expect(wrapper.vm.content).toBe('')
    expect(wrapper.vm.error).not.toBe('')
  })

  it('should load content of a provided item with children when triggered', async () => {
    const wrapper = factory.wrap({ edit: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const selected = {
      path: '/path/to/selected'
    }

    await wrapper.vm.load_file(selected)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const value = 'Test value content.'
    const event = jest.fn()
    wrapper.vm.$on('save', event)

    expect(wrapper.vm.content).toBe('')
    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.editor.$emit('input', value)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.content).toBe(value)
    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should attempt an update and pass to explorer when rename is triggered', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/original.path',
      name: 'proposed.path',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(context.reject).toHaveBeenCalledTimes(0)
    expect(context.resolve).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('rename', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.reject).toHaveBeenCalledTimes(0)
    expect(context.resolve).toHaveBeenCalledTimes(1)
  })

  it('should attempt a move and pass to explorer when move is triggered', async () => {
    path.dirname.mockImplementationOnce(() => '/xyz789')

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/original.path',
      name: '/proposed.path',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('move', '/original.path', '/proposed.path', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.resolve).toHaveBeenCalledTimes(1)
    expect(context.reject).toHaveBeenCalledTimes(0)
  })

  it('should fail to move and pass to explorer when move is triggered when file information cannot be retrieved on destination', async () => {
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/original.path',
      name: '/proposed.path',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('move', '/original.path', '/proposed.path', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(1)
  })

  it('should fail to move and pass to explorer when move is triggered for same source and destination', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/original.path',
      name: '/proposed.path',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('move', '/original.path', '/proposed.path', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(1)
  })

  it('should fail to move and pass to explorer when move is triggered and rename fails', async () => {
    path.dirname.mockImplementationOnce(() => '/xyz789')
    fs.rename.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '/original.path',
      name: '/proposed.path',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('move', '/original.path', '/proposed.path', context)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.resolve).toHaveBeenCalledTimes(0)
    expect(context.reject).toHaveBeenCalledTimes(1)
  })

  it('should attempt to create a file and pass to explorer when create is triggered', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      context: {
        directory: false,
        parent: {
          path: '/abc'
        }
      },
      input: '/xyz',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('create', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(1)
  })

  it('should pass error explorer when file creation is triggered and fails', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))
    fs.writeFile.mockImplementationOnce((path, content, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      context: {
        directory: false,
        parent: {
          path: '/abc'
        }
      },
      input: '/xyz',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('create', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(1)
  })

  it('should attempt to create a directory and pass to explorer when create is triggered', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      context: {
        directory: true,
        parent: {
          path: '/abc'
        }
      },
      input: '/xyz',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('create', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(1)
  })

  it('should pass error explorer when directory creation is triggered and fails', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(new Error('error!')))
    fs.mkdir.mockImplementationOnce(jest.fn((path, options, callback) => (!callback ? options : callback)(new Error('error!'))))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      directory: true,
      path: '/project',
      name: '/new.folder',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('create', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(1)
  })

  it('should fail to create and pass to explorer when create is triggered for existing file', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback(null, true))

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      context: {
        directory: false,
        parent: {
          path: '/abc'
        }
      },
      input: '/xyz',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('create', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(0)
    expect(state.reject).toHaveBeenCalledTimes(1)
  })

  it('should attempt to delete file and pass to explorer when delete is triggered', async () => {
    _lstat.status.isDirectory.mockReturnValueOnce(true)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const state = {
      path: '/abc',
      reject: jest.fn(),
      resolve: jest.fn()
    }

    expect(state.resolve).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer.$emit('delete', state)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(state.resolve).toHaveBeenCalledTimes(1)
  })

  it('should relay calls to create resources to the explorer root', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.explorer.create = jest.fn()
    expect(wrapper.vm.$refs.explorer.create).toHaveBeenCalledTimes(0)

    await expect(wrapper.vm.create('/new.path')).resolves

    expect(wrapper.vm.$refs.explorer.create).toHaveBeenCalledTimes(1)
  })

  it('should relay calls to rename resources to the explorer root', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.explorer.edit = jest.fn()
    expect(wrapper.vm.$refs.explorer.edit).toHaveBeenCalledTimes(0)

    await expect(wrapper.vm.rename('/new.path')).resolves

    expect(wrapper.vm.$refs.explorer.edit).toHaveBeenCalledTimes(1)
  })

  it('should relay delete to create resources to the explorer root', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.$refs.explorer.delete = jest.fn()
    expect(wrapper.vm.$refs.explorer.delete).toHaveBeenCalledTimes(0)

    await expect(wrapper.vm.delete('/new.path')).resolves

    expect(wrapper.vm.$refs.explorer.delete).toHaveBeenCalledTimes(1)
  })
})
