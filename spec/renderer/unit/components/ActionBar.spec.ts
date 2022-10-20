import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import ActionBar from '@/components/ActionBar.vue'

jest.mock('@/store', () => ({
  state: {
    system: {
      edit: false
    },
    repository: {
      path: './tome_path',
      name: 'Name',
      branch: {
        name: 'master',
        error: undefined
      },
      metadata: {
        readme: undefined,
        license: undefined,
        authors: undefined,
        contributors: undefined
      }
    }
  },
  dispatch: jest.fn()
}))

describe('components/ActionBar', () => {
  let vuetify

  const branch = false
  const commit = false
  const push = false

  const factory = assemble(ActionBar, { branch, commit, push })
    .context(() => ({
      vuetify,
      stubs: { LibraryButton: true, RepositoryButton: true }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/open with path when open is called with path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    const path = './file_path'
    await local.open(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/open')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should close library when open is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar
    wrapper.setData({ library: true })

    const path = './file_path'
    await local.open(path)

    expect(local.library).toBe(false)
  })

  it('should dispatch system/close when close is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.close()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/close')

    expect(action).toBeDefined()
  })

  it('should dispatch system/edit with inverse of current system edit when edit is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.edit()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/edit')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/branch with inverse of current system branch when branch is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.branch()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/branch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/commit with inverse of current system commit when commit is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.commit()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/push with inverse of current system push when push is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.push()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/push')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/console with inverse of current system console when console is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.console()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/console')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/search with inverse of current system search when search is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ActionBar

    await local.search()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/search')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })
})
