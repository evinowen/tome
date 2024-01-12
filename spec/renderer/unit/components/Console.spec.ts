import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { DateTime } from 'luxon'
import { createStore } from 'vuex'
import { State, StateDefaults, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import Console from '@/components/Console.vue'

describe('components/Console', () => {
  let vuetify
  let store
  let store_dispatch
  let value = true

  const factory = assemble(Console, { value })
  .context(() => ({
    global: {
      plugins: [ vuetify, [store, key] ],
      stubs: {
        ConsolePage: BasicComponentStub,
        VBtn: BasicComponentStub,
        VCard: BasicComponentStub,
        VCardActions: BasicComponentStub,
        VCardText: BasicComponentStub,
        VDialog: BasicComponentStub,
        VIcon: BasicComponentStub,
      }
    }
  }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        ...StateDefaults,
        events: [
          { type: 'info', message: 'Message 1', datetime: DateTime.now().minus({ minutes: 120 }), stack: '' },
          { type: 'error', message: 'Message 2', datetime: DateTime.now().minus({ minutes: 60 }), stack: '' },
          { type: 'info', message: 'Message 3', datetime: DateTime.now().minus({ minutes: 45 }), stack: '' },
          { type: 'error', message: 'Message 4', datetime: DateTime.now().minus({ minutes: 30 }), stack: '' },
          { type: 'error', message: 'Message 5', datetime: DateTime.now().minus({ minutes: 15 }), stack: '' }
        ],
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'system/console',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    value = true
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch system/console with false when close is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/console', false)
  })

  it('should trim the value and set the stack value when show_stack is called without a value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.detail).toEqual(false)

    const stack = ' Test Message '
    await wrapper.vm.show_stack(stack)

    expect(stack.trim()).toBe('Test Message')
    expect(wrapper.vm.stack).toBe('Test Message')
  })

  it('should trim the value and not set detail to true when show_stack is called without a value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.detail).toEqual(false)

    const stack = '  '
    await wrapper.vm.show_stack(stack)

    expect(stack.trim()).toBe('')
    expect(wrapper.vm.detail).toEqual(false)
  })

  it('should trim the value and set detail to true when show_stack is called with a value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.detail).toEqual(false)

    const stack = ' Test Message '
    await wrapper.vm.show_stack(stack)

    expect(stack.trim()).not.toBe('')
    expect(wrapper.vm.detail).toEqual(true)
  })

  it('should output formatted date when format_date is called with a DateTime value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.detail).toEqual(false)

    const string = await wrapper.vm.format_date(DateTime.now())

    expect(string).toBeDefined()
    expect(string).not.toBe('')
  })

  it('should remove newlines when format_message is called with a value', async () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.detail).toEqual(false)

    const value = 'Test\n\r\n\rValue\n\r'
    const string = await wrapper.vm.format_message(value)

    expect(string).not.toBe('')
    expect(string.indexOf('\n')).toBe(-1)
    expect(string.indexOf('\r')).toBe(-1)
  })
})
