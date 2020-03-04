import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote } from 'electron'

import { createLocalVue, mount } from '@vue/test-utils'
import NewFileService from '@/components/NewFileService.vue'

Vue.use(Vuetify)

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()

  }

}))

const fs = {
  open: jest.fn(),
  close: jest.fn(),
  mkdir: jest.fn()
}

const path = {
  join: jest.fn(),
  relative: jest.fn(),
  isAbsolute: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

const localVue = createLocalVue()

describe('NewFileService.vue', () => {
  let vuetify
  let wrapper

  function wrap (object) {
    wrapper = mount(
      NewFileService,
      {
        localVue,
        vuetify,
        stubs: {
        },
        propsData: {
          active: false,
          target: 'test',
          base: '/root/',
          extension: '.md',
          folder: false,

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

  it('should use target for relative if path is not absolute', async () => {
    path.isAbsolute.mockReturnValue(false)

    wrap()
    wrapper.vm.$nextTick()

    expect(wrapper.vm.relative).toEqual('test')
  })

  it('should calculate relative if path is absolute', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    wrap()
    wrapper.vm.$nextTick()

    expect(wrapper.vm.relative).toEqual('test-relative')
  })

  it('should calculate the correct formatted extension that begins with a dot even if it already has one', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    wrap({ extension: '.test' })
    wrapper.vm.$nextTick()

    expect(wrapper.vm.extension_formatted).toEqual('.test')
  })

  it('should calculate extension that has a dot if it does not have one', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    wrap({ extension: 'test' })
    wrapper.vm.$nextTick()

    expect(wrapper.vm.extension_formatted).toEqual('.test')
  })
})
