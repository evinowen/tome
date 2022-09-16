import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import { DateTime } from 'luxon'
import store from '@/store'
import Console from '@/components/Console.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

const format = {
  date: DateTime.DATE_SHORT,
  time: DateTime.TIME_24_WITH_SHORT_OFFSET
}

describe('Console.vue', () => {
  let vuetify
  let value = true

  const factory = assemble(Console, { value })
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    value = true

    store.state = {
      events: [
        { type: 'info', message: 'Message 1', datetime: DateTime.now().minus({ minutes: 120 }), format },
        { type: 'error', message: 'Message 2', datetime: DateTime.now().minus({ minutes: 60 }), format },
        { type: 'info', message: 'Message 3', datetime: DateTime.now().minus({ minutes: 45 }), format },
        { type: 'error', message: 'Message 4', datetime: DateTime.now().minus({ minutes: 30 }), format },
        { type: 'error', message: 'Message 5', datetime: DateTime.now().minus({ minutes: 15 }), format }
      ]
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/console with false when close is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.close()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/console')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
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
