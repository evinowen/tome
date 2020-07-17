import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote } from 'electron'

import Explorer from '@/components/Explorer.vue'

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

describe('Explorer.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const value = { create: jest.fn(), parent: { remove_item: jest.fn(() => ({ path: '/item.path' })) } }
  const hold = {
    context: {
      path: '/5678ghij',
      parent: {
        remove_item: jest.fn(() => ({ path: '/item.path' }))
      }
    }
  }

  const populate = jest.fn()
  const factory = assemble(Explorer, { value, enabled: true, populate })
    .context(() => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })

  it('store drag state when dragging begins in hold', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.hold).toBeNull()

    await wrapper.vm.$refs.explorer_root.$emit('drag', hold)
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.hold).toBe(hold)
  })

  it('flip edit flag to true when edit method is called', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.editing).toBe(false)

    await wrapper.vm.edit()

    expect(wrapper.vm.editing).toBe(true)
  })

  it('instruct target to create a new node then flip edit flag to true when create method is called', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.editing).toBe(false)

    await wrapper.vm.create('/123abc', false)

    expect(value.create).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.editing).toBe(true)
  })

  it('emit a delete event with a reject/resolve callback when delete is called', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn(({ reject, resolve }) => ({ resolve: resolve(), reject: reject() }))
    wrapper.vm.$on('delete', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(value.parent.remove_item).toHaveBeenCalledTimes(0)

    wrapper.vm.delete('/123abc')

    expect(event).toHaveBeenCalledTimes(1)
    expect(value.parent.remove_item).toHaveBeenCalledTimes(1)
  })

  it('flip edit flag to false when blur event is triggered', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ editing: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.editing).toBe(true)

    await wrapper.vm.$refs.explorer_root.$emit('blur', { context: { emphemeral: false } })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.editing).toBe(false)
  })

  it('instruct parent to destory emphemeral children when blur event is triggered', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ editing: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      ephemeral: true,
      parent: {
        remove_item: jest.fn(() => ({ path: '/item.path' }))
      }
    }

    expect(context.parent.remove_item).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('blur', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.parent.remove_item).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a file and resolve properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '',
      directory: false,
      insert_item: jest.fn(),
      parent: { insert_item: jest.fn() }
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { resolve } = context
      await resolve('/new/path')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(context.parent.insert_item).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(context.parent.insert_item).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a file and reject properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      directory: false,
      insert_item: jest.fn(),
      parent: { insert_item: jest.fn() }
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { reject } = context
      await reject('whoops!')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(context.parent.insert_item).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(context.parent.insert_item).toHaveBeenCalledTimes(0)
  })

  it('emit move event with interactions when drop event is triggered for a folder and resolve properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      directory: true,
      expanded: true,
      insert_item: jest.fn(),
      parent: { insert_item: jest.fn() }
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { resolve } = context
      await resolve('/new/path')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(context.insert_item).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(context.insert_item).toHaveBeenCalledTimes(1)
  })

  it('emit move event with interactions when drop event is triggered for a folder and reject properly', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '',
      directory: true,
      expanded: false,
      $emit: jest.fn(),
      insert_item: jest.fn(),
      parent: { insert_item: jest.fn() }
    }

    const event = jest.fn(async (from_path, to_path, context) => {
      const { reject } = context
      await reject('whoops!')
    })

    wrapper.vm.$on('move', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(context.insert_item).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(context.insert_item).toHaveBeenCalledTimes(0)
  })

  it('expand the folder context when drop event is triggered for a folder', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      path: '',
      directory: true,
      expanded: false,
      $emit: jest.fn(),
      insert_item: jest.fn()
    }

    expect(context.$emit).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('drop', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(context.$emit).toHaveBeenCalledTimes(1)
    expect(context.$emit.mock.calls[0][0]).toBe('toggle')
  })

  it('attempt to create a new object when the field is ephemeral', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: true,
      ephemeral: true,
      path: '/123abc',
      input: '/1234abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve('/new/path')
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('format input for files on create when the input context is a title', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: true,
      directory: false,
      ephemeral: true,
      path: '/123abc',
      input: '/1234abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve('/new/path')
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0].input).not.toBe(context.input)
  })

  it('format input for directories on create when the input context is a title', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: true,
      directory: true,
      ephemeral: true,
      path: '/123abc',
      input: '1234 Abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve('/new/path')
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0].input).not.toBe(context.input)
  })

  it('not format input on create when the input context is not a title', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: false,
      ephemeral: true,
      path: '/123abc',
      input: '1234.abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (state) => {
      const { resolve } = state
      await resolve('/new/path')
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0].input).toBe(context.input)
  })

  it('fail well when attempting to create a new object when the field is ephemeral', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: true,
      ephemeral: true,
      path: '/123abc',
      input: '/1234abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (state) => {
      const { reject } = state
      await reject('whoops!')
    })

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('attempt to rename an object when the field is normal', async () => {
    const wrapper = factory.wrap()
    wrapper.setData({ hold })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const context = {
      title: true,
      ephemeral: false,
      path: '/123abc',
      input: '/1234abcd',
      parent: {
        update: jest.fn()
      },
      error: null,
      $refs: { form: { validate: jest.fn() } }
    }

    const event = jest.fn(async (path, proposed, resolve) => {
      await resolve('/new/path')
    })

    wrapper.vm.$on('rename', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.$refs.explorer_root.$emit('submit', { context })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should return placeholder title for files formatted that have incorrect extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format('file.name.txt')

    expect(formated).toBe(' - ')
  })

  it('should return formatted title for files formatted that have correct extension', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const formated = wrapper.vm.format('file.name.md')

    expect(formated).toBe('File Name')
  })
})
