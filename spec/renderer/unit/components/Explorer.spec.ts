import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as FilesStateDefaults, File } from '@/store/modules/files'
import Explorer from '@/components/Explorer.vue'
import ExplorerNode from '@/components/ExplorerNode.vue'
import { ExplorerNodeGhostType } from '@/components/ExplorerNode.vue'

describe('components/ExplorerNode', () => {
  let vuetify
  let store
  let store_dispatch

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: {
          ...ConfigurationStateDefaults(),
          format_titles: false
        },
        files: {
          ...FilesStateDefaults(),
          base: '/project',
          path: '/project',
          active: '',
          content: '',
          directory: {
            '/project': new File({
              path: '/project',
            })
          }
        },
      },
      actions: stub_actions([
        'actions/execute',
        'files/blur',
        'files/delete',
        'files/edit',
        'files/ghost',
        'files/move',
        'files/open',
        'files/toggle',
        'files/select',
        'files/submit',
        'templates/execute',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

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
    vi.clearAllMocks()
  })

  const value = { create: vi.fn(), parent: { remove_item: vi.fn(() => ({ path: '/item.path' })) } }
  const hold = {
    path: '/project/second'
  }

  const children = []

  const populate = vi.fn(item => {
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

  const factory = assemble(Explorer, { enabled: true })
    .context(() => ({
      global: {
        plugins: [ vuetify, [store, key] ],
        stubs: {
          VIcon: true,
          VContainer: BasicComponentStub,
        }
      }
    }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()
    expect(wrapper).not.toBeUndefined()
  })

  it('should set active file identifier from active store path', () => {
    const file = store.state.files.directory['/project']
    store.state.files.active = file.path

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toBe(file.uuid)
  })

  it('should set blank active file identifier from invalid active store path', () => {
    store.state.files.active = '/fake'

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toEqual('')
  })

  it('store drag state when dragging begins in hold', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(wrapper.vm.hold).toBeNull()

    const node = wrapper.vm.explorer_root
    await node.$emit('drag', hold)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.hold).toEqual(hold)
  })

  it('should dispatch file edit action for path when edit event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.edit({ target: '/project/first' })

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/edit')
  })

  it('should dispatch file delete action for path when delete event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.delete_event('/project/third')

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/delete')
  })

  it('should dispatch file blur action when blur event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.blur()

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/blur')
  })

  it('should dispatch file move action when drop is triggered for a node', async () => {
    const wrapper = factory.wrap()
        wrapper.vm.hold = hold
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    const context = {
      directory: false
    }

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const node = wrapper.vm.explorer_root
    await node.$emit('drop', { context })
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/move')
  })

  it('should dispatch file submit action when submit is triggered for a node', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const context = {
      path: '/project/file.md',
      input: 'file.change.md',
      title: false
    }

    const node = wrapper.vm.explorer_root
    await node.$emit('submit', context)
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/submit')
  })

  it('should throw an exception when no named is passed to format', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => wrapper.vm.format(undefined, undefined)).toThrow(Error)
  })

  it('should throw an exception when a bad folder name is passed to format', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(() => wrapper.vm.format(undefined, true)).toThrow(Error)
  })

  it('should throw an exception for items formatted that are titled with invalid symbols', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(() => wrapper.vm.format('FILE-%%%%')).toThrow(Error)
  })

  it('should return formatted title for files formatted that have correct extension', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    const formated = wrapper.vm.format('file.name.md')

    expect(formated).toBe('File Name')
  })

  it('should call store file toggle action for item path provided by toggle event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.toggle({ path: '/project/third' })

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/toggle')
  })

  it('should call store file select action for item path provided by select event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.select({ path: '/project/third' })

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('files/select')
  })

  it('should dispatch files/ghost with path provided on file create event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const target = '/project/third'
    await wrapper.vm.create({ target, type: ExplorerNodeGhostType.FILE })

    const data = { path: target, directory: false }
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', data)
  })

  it('should dispatch files/ghost with path provided on directory create event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const target = '/project/third'
    await wrapper.vm.create({ target, type: ExplorerNodeGhostType.DIRECTORY })

    const data = { path: target, directory: true }
    expect(store_dispatch).toHaveBeenCalledWith('files/ghost', data)
  })

  it('should dispatch templates/ghost on template create event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const target = ''
    await wrapper.vm.create({ target, type: ExplorerNodeGhostType.TEMPLATE })

    expect(store_dispatch).toHaveBeenCalledWith('templates/ghost')
  })

  it('should dispatch actions/ghost on action create event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const target = ''
    await wrapper.vm.create({ target, type: ExplorerNodeGhostType.ACTION })

    expect(store_dispatch).toHaveBeenCalledWith('actions/ghost')
  })

  it('should dispatch files/open with path when open is called with state', async () => {
    const wrapper = factory.wrap()
    const data = { target: '/project/third', container: false }

    await wrapper.vm.open(data)

    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: data.target, container: data.container })
  })

  it('should dispatch files/open with path when open is called with state when container is true', async () => {
    const wrapper = factory.wrap()
    const data = { target: '/project/third', container: true }

    await wrapper.vm.open(data)

    expect(store_dispatch).toHaveBeenCalledWith('files/open', { path: data.target, container: data.container })
  })

  it('should instruct the template service to execute when template is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await wrapper.vm.template(state)

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('templates/execute')
    expect(store_dispatch.mock.calls[0][1]).toBe(state)
  })

  it('should instruct the action service to execute when action is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    await wrapper.vm.$nextTick()

    store_dispatch.mockClear()

    expect(store_dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await wrapper.vm.action(state)

    expect(store_dispatch).toHaveBeenCalledTimes(1)
    expect(store_dispatch.mock.calls[0][0]).toBe('actions/execute')
    expect(store_dispatch.mock.calls[0][1]).toBe(state)
  })
})
