import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import ActionBar from '@/components/ActionBar.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('ActionBar.vue', () => {
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

    store.state = {
      system: {
        edit: false
      },
      repository: {
        path: './tome_path',
        name: 'Name',
        branch: {
          name: 'master',
          error: null
        },
        metadata: {
          readme: null,
          license: null,
          authors: null,
          contributors: null
        }
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/open with path when open is called with path', async () => {
    const wrapper = factory.wrap()

    const path = './file_path'
    await wrapper.vm.open(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/open')

    expect(action).toBeDefined()
    expect(data).toEqual(path)
  })

  it('should close library when open is called', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ library: true })

    const path = './file_path'
    await wrapper.vm.open(path)

    expect(wrapper.vm.library).toBe(false)
  })

  it('should dispatch system/close when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/close')

    expect(action).toBeDefined()
  })

  it('should dispatch system/edit with inverse of current system edit when edit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.edit()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/edit')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/branch with inverse of current system branch when branch is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.branch()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/branch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/commit with inverse of current system commit when commit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.commit()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/push with inverse of current system push when push is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.push()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/push')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/console with inverse of current system console when console is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.console()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/console')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system/search with inverse of current system search when search is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.search()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/search')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })
})
