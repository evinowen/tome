import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify);

import ActionBar from '@/components/ActionBar.vue'

import { createLocalVue, mount } from '@vue/test-utils'

const localVue = createLocalVue();

describe('ActionBar.vue', () => {
  let vuetify;
  let wrapper;

  beforeEach(() => {
    vuetify = new Vuetify();

    let tome = {
      path: '/pa/th/to/to/me',
      name: 'Name',

      branch: {
        name: 'master',
        error: null,

      },

      status: {
        available: { new: 0, renamed: 0, modified: 0, deleted: 0 },
        staged: { new: 0, renamed: 0, modified: 0, deleted: 0 },

      },

    };

    let waiting = 0;
    let commit = false;
    let push = false;

    wrapper = mount(
      ActionBar,
      {
        localVue,
        vuetify,
        stubs: {
          StatusButton: true,
        },
        propsData: {
          tome,
          waiting,
          commit,
          push,
        },
      }
    );

  });

  afterEach(() => {
    jest.clearAllMocks();

  });

  it('emits a commit event when the commit button is clicked', () => {
    const event = jest.fn();

    wrapper.vm.$on('commit', event);

    expect(event).toHaveBeenCalledTimes(0);

    wrapper.find('[action-bar-commit]').trigger('click');

    expect(event).toHaveBeenCalledTimes(1);

  });

  it('emits a push event when the push button is clicked', () => {
    const event = jest.fn();

    wrapper.vm.$on('push', event);

    expect(event).toHaveBeenCalledTimes(0);

    wrapper.find('[action-bar-push]').trigger('click');

    expect(event).toHaveBeenCalledTimes(1);

  });

});
