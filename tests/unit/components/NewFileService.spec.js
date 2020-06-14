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
  open: jest.fn((path, flags, callback) => callback(0, 1)),
  close: jest.fn((handler, callback) => callback(0)),
  mkdir: jest.fn((path, options, callback) => callback(0)),
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

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(NewFileService, {
    active: true,
    target: 'test',
    base: '/root/',
    extension: '.md',
    folder: false,
  })
  .context(() => ({ vuetify, stubs: { VDialog: true } }))

  it('should use target for relative if path is not absolute', async () => {
    path.isAbsolute.mockReturnValue(false)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.relative).toEqual('test')
  })

  it('should calculate relative if path is absolute', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.relative).toEqual('test-relative')
  })

  it('should calculate the correct formatted extension that begins with a dot even if it already has one', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    const wrapper = factory.wrap({ extension: '.test' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.extension_formatted).toEqual('.test')
  })

  it('should calculate extension that has a dot if it does not have one', async () => {
    path.isAbsolute.mockReturnValue(true)
    path.relative.mockReturnValue('test-relative')

    const wrapper = factory.wrap({ extension: 'test' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.extension_formatted).toEqual('.test')
  })

  it('should attempt to create a file or folder when create is clicked', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const events = {
      create: jest.fn(),
      close: jest.fn()
    }

    wrapper.vm.$on('create', events.create)
    wrapper.vm.$on('close', events.close)

    expect(events.create).toHaveBeenCalledTimes(0)
    expect(events.close).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'create' }).trigger('click')
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(events.create).toHaveBeenCalledTimes(1)
    expect(events.close).toHaveBeenCalledTimes(1)
  })

  it('should attempt to create a file when form submitted', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const events = {
      create: jest.fn(),
      close: jest.fn()
    }

    wrapper.vm.$on('create', events.create)
    wrapper.vm.$on('close', events.close)

    expect(events.create).toHaveBeenCalledTimes(0)
    expect(events.close).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'form' }).trigger('submit')
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(events.create).toHaveBeenCalledTimes(1)
    expect(events.close).toHaveBeenCalledTimes(1)
  })

  it('should attempt to create a folder when form submitted', async () => {
    const wrapper = factory.wrap({ folder: false })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const events = {
      create: jest.fn(),
      close: jest.fn()
    }

    wrapper.vm.$on('create', events.create)
    wrapper.vm.$on('close', events.close)

    expect(events.create).toHaveBeenCalledTimes(0)
    expect(events.close).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'form' }).trigger('submit')
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(events.create).toHaveBeenCalledTimes(1)
    expect(events.close).toHaveBeenCalledTimes(1)
  })

  it('should emit close event when cancel is clicked', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.find({ ref: 'cancel' }).trigger('click')
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
