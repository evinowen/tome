import { assemble } from '@/../tests/helpers'
import { remote, shell } from 'electron'
import store from '@/store'
import Vue from 'vue'
import Vuetify from 'vuetify'

import App from '@/App.vue'

Vue.use(Vuetify)

jest.mock('electron', () => ({ remote: { require: jest.fn() }, shell: {} }))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

const fs_callback = (options, callback) => (options && callback ? callback : options)(null)

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

remote.app = {
  getPath: jest.fn(() => '/root/')
}

shell.openPath = jest.fn()

store.state = {
  tome: {
    loaded: true,
    path: '/tome',
    remotes: [
      { name: 'production', url: 'git@production.example.com:remote.git' },
      { name: 'origin', url: 'git@git.example.com:remote.git' }
    ]
  },
  configuration: {
    default_remote: 'origin',
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
        Push: { template: '<div />', methods: { push: jest.fn() } },
        Commit: { template: '<div />', methods: { commit: jest.fn() } },
        Branch: true,
        Console: true,
        Settings: true,
        ContextMenuService: true,
        ShortcutService: true,
        SearchService: true,
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

  it('should open directory context when triggered by editor interface using an instance', async () => {
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

  it('should open directory context when triggered by editor interface using a selection', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.context.visible).toBeFalsy()

    const state = {
      selection: {
        context: []
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

  it('should dispatch "files/update" and "files/save" on call to save', async () => {
    const wrapper = factory.wrap()

    const state = {
      content: 'This is static content.'
    }

    await wrapper.vm.save(state)

    expect(store.dispatch).toHaveBeenCalledTimes(2)

    expect(store.dispatch.mock.calls[0][0]).toBe('files/update')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ content: state.content })

    expect(store.dispatch.mock.calls[1][0]).toBe('files/save')
  })

  it('should dispatch "library/add" with path on call to set_tome', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'

    await wrapper.vm.set_tome(path)

    expect(store.dispatch.mock.calls[0][0]).toEqual('library/add')
    expect(store.dispatch.mock.calls[0][1]).toEqual(path)
  })

  it('should dispatch "tome/load" with path on call to set_tome', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'

    await wrapper.vm.set_tome(path)

    expect(store.dispatch.mock.calls[1][0]).toEqual('tome/load')
    expect(store.dispatch.mock.calls[1][1]).toEqual(path)
  })

  it('should dispatch "files/initialize" with path on call to set_tome', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'

    await wrapper.vm.set_tome(path)

    expect(store.dispatch.mock.calls[2][0]).toEqual('files/initialize')
    expect(store.dispatch.mock.calls[2][1]).toEqual({ path })
  })

  it('should dispatch "tome/inspect" on call to set_tome', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'

    await wrapper.vm.set_tome(path)

    expect(store.dispatch.mock.calls[3][0]).toEqual('tome/inspect')
  })

  it('should dispatch "tome/clear" on call to clear_tome', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.clear_tome()

    expect(store.dispatch.mock.calls[0][0]).toEqual('tome/clear')
  })

  it('should flush debounced save method on call to toggle', async () => {
    const wrapper = factory.wrap()

    wrapper.vm.debounce_save.flush = jest.fn()

    await wrapper.vm.toggle(true)

    expect(wrapper.vm.debounce_save.flush).toHaveBeenCalledTimes(1)
  })

  it('should set edit value to input on call to toggle', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.edit).toBe(false)

    await wrapper.vm.toggle(true)

    expect(wrapper.vm.edit).toBe(true)
  })

  it('should stage and execute commit on call to quick_commit', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.quick_commit()

    expect(wrapper.vm.edit).toBe(true)
    expect(wrapper.vm.commit).toBe(true)
    expect(wrapper.vm.commit_confirm).toBe(true)

    expect(store.dispatch).toHaveBeenCalledTimes(1)

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/stage')
    expect(store.dispatch.mock.calls[0][1]).toEqual('*')
  })

  it('should stage and execute push on call to quick_push', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.quick_push()

    expect(wrapper.vm.push).toBe(true)
    expect(wrapper.vm.push_confirm).toBe(true)

    expect(store.dispatch).toHaveBeenCalledTimes(2)

    expect(store.dispatch.mock.calls[0][0]).toBe('tome/credentials')
    expect(store.dispatch.mock.calls[1][0]).toBe('tome/remote')
  })
})
