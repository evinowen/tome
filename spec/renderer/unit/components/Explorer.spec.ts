import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import store from '@/store'
import Explorer from '@/components/Explorer.vue'
import ExplorerNode from '@/components/ExplorerNode.vue'
import { ExplorerNodeGhostType } from '@/components/ExplorerNode.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('components/ExplorerNode', () => {
  let vuetify

  beforeEach(() => {
    const settable_store = store as { state: any }
    settable_store.state = {
      repository: {
        name: 'project',
        path: '/project'
      },
      configuration: {
        format_titles: false
      },
      files: {
        base: '/project',
        path: '/project',
        active: '',
        content: '',
        error: '',
        directory: {
          '/project': {
            expanded: false,
            children: []
          }
        }
      }
    }

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
    path: '/project/second'
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
    expect(wrapper).not.toBeUndefined()
  })

  it('store drag state when dragging begins in hold', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(local.hold).toBeUndefined()

    const node = local.$refs.explorer_root as ExplorerNode
    await node.$emit('drag', hold)
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.hold).toBe(hold)
  })

  it('should dispatch file edit action for path when edit event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.edit({ target: '/project/first' })

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/edit')
  })

  it('should dispatch file delete action for path when delete event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.delete('/project/third')

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/delete')
  })

  it('should dispatch file blur action when blur event is triggered', async () => {
    const wrapper = factory.wrap({ expanded: true })
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.blur()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/blur')
  })

  it('should dispatch file move action when drop is triggered for a node', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    local.hold = hold
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    const context = {
      directory: false
    }

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    const node = local.$refs.explorer_root as ExplorerNode
    await node.$emit('drop', { context })
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/move')
  })

  it('should dispatch file submit action when submit is triggered for a node', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    const context = {
      path: '/project/file.md',
      input: 'file.change.md',
      title: false
    }

    const node = local.$refs.explorer_root as ExplorerNode
    await node.$emit('submit', context)
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/submit')
  })

  it('should throw an exception when no named is passed to format', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => local.format(undefined, undefined)).toThrow(Error)
  })

  it('should throw an exception when a bad folder name is passed to format', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(() => local.format(undefined, true)).toThrow(Error)
  })

  it('should throw an exception for items formatted that are titled with invalid symbols', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(() => local.format('FILE-%%%%')).toThrow(Error)
  })

  it('should return formatted title for files formatted that have correct extension', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    const formated = local.format('file.name.md')

    expect(formated).toBe('File Name')
  })

  it('should call store file toggle action for item path provided by toggle event', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.toggle({ path: '/project/third' })

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/toggle')
  })

  it('should call store file select action for item path provided by select event', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.select({ path: '/project/third' })

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/select')
  })

  it('should call store file ghost action for item path provided by create event', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    await local.create({ target: '/project/third', type: ExplorerNodeGhostType.FILE })

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('files/ghost')
  })

  it('should dispatch files/open with path when open is called with state', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer

    await local.open({ target: '/project/third', container: false })

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'files/open')

    expect(action).toBeDefined()
  })

  it('should dispatch files/open with path when open is called with state when container is true', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Explorer

    await local.open({ target: '/project/third', container: true })

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'files/open')

    expect(action).toBeDefined()
  })

  it('should instruct the template service to execute when template is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await local.template(state)

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('templates/execute')
    expect(mocked_store.dispatch.mock.calls[0][1]).toBe(state)
  })

  it('should instruct the action service to execute when action is called', async () => {
    const wrapper = factory.wrap({ expanded: true })
    const local = wrapper.vm as Explorer
    await expect(local.$nextTick()).resolves.toBeDefined()
    const mocked_store = jest.mocked(store)
    mocked_store.dispatch.mockClear()

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(0)

    const state = { test: 'test' }
    await local.action(state)

    expect(mocked_store.dispatch).toHaveBeenCalledTimes(1)
    expect(mocked_store.dispatch.mock.calls[0][0]).toBe('actions/execute')
    expect(mocked_store.dispatch.mock.calls[0][1]).toBe(state)
  })
})
