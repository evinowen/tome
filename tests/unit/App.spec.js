import { assemble } from '@/../tests/helpers'
import { remote, shell } from 'electron'
import store from '@/store'
import Vue from 'vue'
import Vuetify from 'vuetify'

import App from '@/App.vue'

Vue.use(Vuetify)

jest.mock('electron', () => ({ remote: {}, shell: {} }))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

const fs_callback = (options, callback) => (options && callback ? callback : options)(null)
const fs_callback_error = (options, callback) => (options && callback ? callback : options)('error!')

const _lstat = {
  status: {
    isDirectory: jest.fn(() => false)
  }
}

const fs = {
  open: jest.fn((path, flags, callback) => callback(null, 1)),
  close: jest.fn((handler, callback) => callback(null)),
  mkdir: jest.fn((path, options, callback) => fs_callback(options, callback)),
  lstat: jest.fn((handler, callback) => callback(null, _lstat.status))
}

const path = {
  join: jest.fn(),
  relative: jest.fn(),
  isAbsolute: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

remote.app = {
  getPath: jest.fn(() => '/root/')
}

shell.openItem = jest.fn()

store.state = {
  tome: { },
  tome_file_path: '/file/path',
  tome_app_config_path: '/config/path/config.json',
  tome_app_config_path_dir: '/config/path',
  configuration: {
    private_key: 'key',
    public_key: 'key.pub',
    passphrase: 'passphrase'
  }
}

describe('App.vue', () => {
  let vuetify

  const factory = assemble(App)
    .context(() => ({
      stubs: {
        NewFileService: true,
        ContextMenuService: true,
        SystemBar: true,
        EditorInterface: true,
        ActionBar: true
      }
    }))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)

      vuetify = new Vuetify()
      context.vuetify = vuetify
    })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be able to be mocked and prepared for testing', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper).not.toBeNull()
  })

  it('should attempt to create configuration directory and file if they do not exist', async () => {
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper).not.toBeNull()
    expect(fs.mkdir).toHaveBeenCalledTimes(1)
    expect(fs.open).toHaveBeenCalledTimes(1)
    expect(fs.close).toHaveBeenCalledTimes(1)
  })

  it('should set error if attempt to create configuration directory fails', async () => {
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    fs.mkdir.mockImplementationOnce((path, options, callback) => fs_callback_error(options, callback))

    const wrapper = factory.wrap()

    expect(wrapper.vm.error).toBeNull()

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.error).not.toBeNull()
  })

  it('should set error if attempt to create configuration file fails because the file cannot be opened', async () => {
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    fs.open.mockImplementationOnce((path, flags, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()

    expect(wrapper.vm.error).toBeNull()

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.error).not.toBeNull()
  })

  it('should set error if attempt to create configuration file fails because the file cannot be closed', async () => {
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))
    fs.lstat.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    fs.close.mockImplementationOnce((handler, callback) => callback(new Error('error!')))

    const wrapper = factory.wrap()

    expect(wrapper.vm.error).toBeNull()

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.error).not.toBeNull()
  })

  it('should load the provided path as the current Tome when set_tome is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.reload_run = jest.fn()
    store.dispatch.mockClear()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.set_tome('/test/path')

    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[0][0]).toBe('load')
    expect(store.dispatch.mock.calls[1][0]).toBe('files/initialize')
    expect(wrapper.vm.reload_run).toHaveBeenCalledTimes(1)
  })

  it('should open directory context when triggered by editor interface', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.context.visible).toBeFalsy()

    const state = {
      instance: {
        path: '/path/to/context',
        directory: true,
        $emit: jest.fn()
      },
      event: {
        clientX: 1,
        clientY: 1
      }
    }

    await wrapper.vm.$refs.interface.$emit('context', state)

    expect(wrapper.vm.context.visible).toBeTruthy()
  })

  it('should open file context when triggered by editor interface', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.context.visible).toBeFalsy()

    const state = {
      instance: {
        path: '/path/to/context',
        directory: false,
        $emit: jest.fn()
      },
      event: {
        clientX: 1,
        clientY: 1
      }
    }

    await wrapper.vm.$refs.interface.$emit('context', state)

    expect(wrapper.vm.context.visible).toBeTruthy()
  })

  it('should start store counter when a setting field is updated', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.settings.triggered).toBeFalsy()
    expect(wrapper.vm.settings.counter).toBe(0)

    wrapper.vm.proxy_file = jest.fn((event) => ({ path: '/private/key/path' }))
    await wrapper.find({ ref: 'private_key' }).trigger('change')

    expect(wrapper.vm.settings.triggered).toBeTruthy()
    expect(wrapper.vm.settings.counter).not.toBe(0)
  })

  it('should follow the reload timer cycle when Editor Interface emits a save event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    store.dispatch.mockClear()

    expect(wrapper.vm.reload.timeout).toBeFalsy()
    expect(store.dispatch).toHaveBeenCalledTimes(0)

    wrapper.vm.$refs.interface.$emit('save')

    await expect(new Promise((resolve, reject) => {
      let timeout = 10
      const wait = () => {
        if (wrapper.vm.reload.triggered) {
          if (timeout--) {
            setTimeout(wait, 1000)
          } else {
            reject(new Error('Time limit exceeded'))
          }
        } else {
          resolve(true)
        }
      }

      wait()
    })).resolves.toBeDefined()

    expect(wrapper.vm.reload.triggered).toBeFalsy()
    expect(store.dispatch).toHaveBeenCalledTimes(2)
    expect(store.dispatch.mock.calls[0][0]).toBe('writeConfiguration')
    expect(store.dispatch.mock.calls[1][0]).toBe('inspect')
  }, 20000)

  it('should follow the settings timer cycle when the counter is started', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.settings.run = jest.fn()

    expect(wrapper.vm.settings.timeout).toBeFalsy()
    expect(wrapper.vm.settings.run).toHaveBeenCalledTimes(0)

    await wrapper.vm.counter_start('settings')

    await new Promise((resolve, reject) => {
      let timeout = 10
      const wait = () => {
        if (wrapper.vm.settings.triggered) {
          if (timeout--) {
            setTimeout(wait, 1000)
          } else {
            reject(new Error('Time limit exceeded'))
          }
        } else {
          resolve()
        }
      }

      wait()
    })

    expect(wrapper.vm.settings.triggered).toBeFalsy()
    expect(wrapper.vm.settings.run).toHaveBeenCalledTimes(1)
  }, 20000)
})
