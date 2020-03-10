import Vue from 'vue'
import Vuetify from 'vuetify'

import { createLocalVue, mount } from '@vue/test-utils'
import Explorer from '@/components/Explorer.vue'

Vue.use(Vuetify)

const localVue = createLocalVue()

describe('Explorer.vue', () => {
  let vuetify

  function wrap (object) {
    return mount(
      Explorer,
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

  it('should compute expanded root icon when instance is not a child or closed', async () => {
    const wrapper = wrap({ leaf: false })
    wrapper.vm.$nextTick()

    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should compute closed folder icon instance is a child but not expanded', async () => {
    const wrapper = wrap({ leaf: true })
    wrapper.vm.$nextTick()

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })
})
