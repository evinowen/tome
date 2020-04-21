import Vue from 'vue'
import Vuetify from 'vuetify'

import { createLocalVue, mount } from '@vue/test-utils'
import ExplorerDirectory from '@/components/ExplorerDirectory.vue'

Vue.use(Vuetify)

const localVue = createLocalVue()

describe('ExplorerDirectory.vue', () => {
  let vuetify

  function wrap (object) {
    return mount(
      ExplorerDirectory,
      {
        localVue,
        vuetify,
        propsData: {
          name: 'Name',
          path: '/pa/th/to/fi/le',
          active: 'Active',
          populate: null,
          new_file: null,
          new_folder: null,
          open_folder: null,
          leaf: false,

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

  it('should compute expanded root icon when instance is not a leaf or closed', async () => {
    const wrapper = wrap({ leaf: false })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should compute closed folder icon when instance is a leaf but not expanded', async () => {
    const wrapper = wrap({ leaf: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })
})