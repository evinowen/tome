import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import ExplorerNode from '@/components/ExplorerNode.vue'
import { FileRelationshipType } from '@/store/modules/files/file'

jest.mock('@/store', () => ({
  state: {
    files: {
      directory: {
        '1234-test-1234-test': {
          name: 'Name',
          path: '/pa/th/to/fi/le.txt',
          extension: 'txt',
          image: false,
          children: [],
          active: 'Active',
          populate: undefined,
          directory: false
        }
      }
    },
    clipboard: {
      content: { type: 'file', target: '/path' }
    },
    repository: {
      path: '/project'
    },
    templates: {
      options: ['one', 'two', 'three']
    },
    actions: {
      options: ['one', 'two', 'three']
    }
  },
  dispatch: jest.fn()
}))

const mocked_store = jest.mocked(store)

const uuid = '1234-test-1234-test'
const file = store.state.files.directory[uuid]

describe('components/ExplorerNode', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
    file.relationship = FileRelationshipType.None
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const format = jest.fn((name) => name)

  const factory = assemble(ExplorerNode, {
    uuid,
    active: 'Active',
    format
  })
    .context(() => ({ vuetify }))

  it('should produce itself when instance is computed', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.instance).toBe(wrapper.vm)
  })

  it('should be flagged as system if the relationship equals root', async () => {
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.system).toEqual(true)
  })

  it('should be flagged as system if the relationship equals tome', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.system).toEqual(true)
  })

  it('should emit a drag event when a drag starts with this component', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    local.$on('drag', event)

    expect(event).toHaveBeenCalledTimes(0)

    await local.drag_start({
      dataTransfer: {},
      target: {
        style: {}
      }
    })

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit a drop event when a drop starts with this component', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    local.$on('drop', event)

    expect(event).toHaveBeenCalledTimes(0)

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    await local.drop({
      target: {
        hasAttribute: jest.fn(() => true),
        classList: { remove: jest.fn() },
        closest: jest.fn(() => elm),
        parentElement: undefined
      }
    })

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should reset opacity when dragging ends', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    const event = {
      dataTransfer: {},
      target: {
        style: { opacity: 1 }
      }
    }

    const opacity = event.target.style.opacity

    await local.drag_start(event)

    expect(event.target.style.opacity).not.toBe(opacity)

    await local.drag_end(event)

    expect(event.target.style.opacity).toBe(opacity)
  })

  it('should determine the correct parent container when a drag begins', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        closest: jest.fn(() => elm),
        parentElement: {
          hasAttribute: jest.fn(() => true),
          classList: { add: jest.fn() }
        }
      }
    }

    await local.drag_start(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await local.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
  })

  it('should determine the correct parent container when a drag ends', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    const elm = {
      classList: { add: jest.fn(), remove: jest.fn() }
    }

    const event = {
      dataTransfer: {},
      target: {
        hasAttribute: jest.fn(() => false),
        style: { opacity: 1 },
        closest: jest.fn(() => elm),
        parentElement: {
          hasAttribute: jest.fn(() => true),
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          }
        }
      }
    }

    await local.drag_start(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(0)

    await local.drag_enter(event)

    expect(elm.classList.add).toHaveBeenCalledTimes(1)
    expect(elm.classList.remove).toHaveBeenCalledTimes(0)

    await local.drag_leave(event)

    expect(elm.classList.remove).toHaveBeenCalledTimes(1)
  })

  it('should refresh input field value when focus is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    wrapper.setData({ input: 'test' })
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.input).not.toBe(local.display)

    await local.focus()

    expect(local.input).toBe(local.display)
  })

  it('should format the display name if title is set and instance is non-system', async () => {
    const format = jest.fn()
    const wrapper = factory.wrap({ title: true, format })
    const local = wrapper.vm as ExplorerNode
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(format).toHaveBeenCalledTimes(2)
  })

  it('should find a placeholder display name if title is set and format fails', async () => {
    format.mockImplementationOnce(() => { throw new Error('Mock Error') })
    const wrapper = factory.wrap({ title: true, format })
    const local = wrapper.vm as ExplorerNode
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(format).toHaveBeenCalledTimes(2)
  })

  it('should emit open event when Open context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('open', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action
    for (const item of local.context) {
      if (item.title === 'Open') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit open event when Open Folder context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('open', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action
    for (const item of local.context) {
      if (item.title === 'Open Folder') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit open event when New File context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('create', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action

    for (const item of local.context) {
      if (item.title === 'New File') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit create event when New Folder context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('create', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action
    for (const item of local.context) {
      if (item.title === 'New Folder') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should dispatch the cut store action when Cut context menu action is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.context.find(item => item.title === 'Cut').action()

    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/cut')

    expect(action).toBeDefined()
  })

  it('should emit open event when Copy context menu action is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.context.find(item => item.title === 'Copy').action()

    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/copy')

    expect(action).toBeDefined()
  })

  it('should dispatch paste action when Paste context menu action is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.context.find(item => item.title === 'Paste').action()

    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/paste')

    expect(action).toBeDefined()
  })

  it('should return true for paste active state when store has paste value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    await expect(local.$nextTick()).resolves.toBeDefined()

    let active
    for (const item of local.context) {
      if (item.title === 'Paste') {
        active = item.active
      }
    }

    expect(active()).toBeTruthy()
  })

  it('should emit edit event when Rename context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('edit', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action
    for (const item of local.context) {
      if (item.title === 'Rename') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit delete event when Delete context menu action is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as ExplorerNode

    local.$on('delete', event)
    await expect(local.$nextTick()).resolves.toBeDefined()

    let action
    for (const item of local.context) {
      if (item.title === 'Delete') {
        action = item.action
      }
    }

    expect(event).toHaveBeenCalledTimes(0)

    await action()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
