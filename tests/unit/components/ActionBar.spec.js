import Vue from 'vue'
import Vuetify from 'vuetify'

import ActionBar from '@/components/ActionBar.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {}
}))

const localVue = createLocalVue()

describe('ActionBar.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      tome: {
        path: '/pa/th/to/to/me',
        name: 'Name',
        branch: {
          name: 'master',
          error: null

        },
        status: {
          available: { new: 0, renamed: 0, modified: 0, deleted: 0 },
          staged: { new: 0, renamed: 0, modified: 0, deleted: 0 }

        }
      },
      tome_config: null,
      tome_file: '',
      tome_file_selected: '',
      tome_file_path: '',
      tome_file_data: '',
      tome_file_error: '',
      tome_file_actions: null,
      tome_file_actions_root: null,
      tome_ready: false,
      tome_app_config_path: '',
      tome_app_config_path_dir: ''
    }

    const waiting = 0
    const commit = false
    const push = false

    wrapper = mount(
      ActionBar,
      {
        localVue,
        vuetify,
        stubs: {
          StatusButton: true
        },
        propsData: {
          waiting,
          commit,
          push
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('emits a commit event when the commit button is clicked', () => {
    const event = jest.fn()

    wrapper.vm.$on('commit', event)

    expect(event).toHaveBeenCalledTimes(0)

    wrapper.find('[action-bar-commit]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emits a push event when the push button is clicked', () => {
    const event = jest.fn()

    wrapper.vm.$on('push', event)

    expect(event).toHaveBeenCalledTimes(0)

    wrapper.find('[action-bar-push]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })
})
