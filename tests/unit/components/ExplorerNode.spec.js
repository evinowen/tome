import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

import { createLocalVue, mount } from '@vue/test-utils'
import ExplorerNode from '@/components/ExplorerNode.vue'

const localVue = createLocalVue();

describe('ExplorerNode.vue', () => {
  let vuetify;
  let wrapper;

  function wrap(object) {
    wrapper = mount(
      ExplorerNode,
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

        },
      }
    );

  };

  beforeEach(() => {
    vuetify = new Vuetify();

  });

  afterEach(() => {
    jest.clearAllMocks();

  });

  it('should be disabled if the filename equals .git', async () => {
    wrap({ name: '.git' });
    wrapper.vm.$nextTick();

    expect(wrapper.vm.disabled).toEqual(true);

  });

});
