import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'

import ActionBar from '@/components/ActionBar.vue'
import store from '@/store'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

jest.mock('@/store', () => ({
  state: {},
  dispatch: jest.fn()
}))

describe('ActionBar.vue', () => {
  const branch = false
  const commit = false
  const push = false

  const factory = assemble(ActionBar, { branch, commit, push })
    .context(() => ({ stubs: { LibraryButton: true, RepositoryButton: true } }))
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)
      context.vuetify = new Vuetify()
    })

  beforeEach(() => {
    window._.reset_dialog()

    store.state = {
      tome: {
        path: './tome_path',
        name: 'Name',
        branch: {
          name: 'master',
          error: null
        },
        status: {
          available: { new: 0, renamed: 0, modified: 0, deleted: 0 },
          staged: { new: 0, renamed: 0, modified: 0, deleted: 0 }
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

  it('should emit "open" event with path when open called with path', async () => {
    const wrapper = factory.wrap()
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    const path = './file_path'
    await wrapper.vm.open(path)

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0]).toBe(path)
  })

  it('should pass dialog selected file to "open" event with path when open called without a path', async () => {
    const wrapper = factory.wrap()
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0]).toBe('/project')
  })

  it('should not emit an "open" event when open called without a path and dialog is canceled', async () => {
    const wrapper = factory.wrap()
    window._.trip_canceled_dialog()

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should not emit an "open" event when open called without a path and file is not included', async () => {
    const wrapper = factory.wrap()
    window._.trip_empty_dialog()

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should return value of diabled when true is passed into disabled_unless', async () => {
    const wrapper = factory.wrap()
    expect(wrapper.vm.disabled).toEqual(false)

    const disabled = wrapper.vm.disabled_unless(true)

    expect(disabled).toEqual(false)
  })

  it('should return OR of toggle values when false is passed into disabled_unless', async () => {
    const wrapper = factory.wrap({ branch: true })

    expect(wrapper.vm.disabled).toEqual(false)
    expect(wrapper.vm.branch).toEqual(true)
    expect(wrapper.vm.commit).toEqual(false)
    expect(wrapper.vm.push).toEqual(false)

    const disabled = wrapper.vm.disabled_unless(false)

    expect(disabled).toEqual(true)
  })

  it('should dispatch file select with path when open_file called with path', async () => {
    const wrapper = factory.wrap()
    const path = '/project'
    await wrapper.vm.open_file(path)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('files/select')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ path })
  })
})
