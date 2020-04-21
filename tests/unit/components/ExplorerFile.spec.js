import Vue from 'vue'
import Vuetify from 'vuetify'

import { createLocalVue, mount } from '@vue/test-utils'
import ExplorerFile from '@/components/ExplorerFile.vue'

Vue.use(Vuetify)

const localVue = createLocalVue()

describe('ExplorerFile.vue', () => {
  let vuetify
  let wrapper

  function wrap (object) {
    wrapper = mount(
      ExplorerFile,
      {
        localVue,
        vuetify,
        stubs: {
        },
        propsData: {
          name: 'Name',
          path: '/pa/th/to/fi/le',
          active: 'Active',
          populate: null,
          new_file: null,
          new_folder: null,
          open_folder: null,
          highlight: 'Highlight',
          directory: false,
          parent: {},

          ...(object || {})

        }
      }

    )
  }

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be disabled if the filename equals .git', async () => {
    wrap({ name: '.git' })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.disabled).toEqual(true)
  })
})
