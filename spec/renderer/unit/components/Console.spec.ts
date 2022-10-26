import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import { DateTime } from 'luxon'
import store from '@/store'
import Console from '@/components/Console.vue'

jest.mock('@/store', () => ({
  state: {
    events: [
      { type: 'info', message: 'Message 1', datetime: DateTime.now().minus({ minutes: 120 }), format },
      { type: 'error', message: 'Message 2', datetime: DateTime.now().minus({ minutes: 60 }), format },
      { type: 'info', message: 'Message 3', datetime: DateTime.now().minus({ minutes: 45 }), format },
      { type: 'error', message: 'Message 4', datetime: DateTime.now().minus({ minutes: 30 }), format },
      { type: 'error', message: 'Message 5', datetime: DateTime.now().minus({ minutes: 15 }), format }
    ]
  },
  dispatch: jest.fn()
}))

const format = {
  date: DateTime.DATE_SHORT,
  time: DateTime.TIME_24_WITH_SHORT_OFFSET
}

describe('components/Console', () => {
  let vuetify
  let value = true

  const factory = assemble(Console, { value })
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
    value = true
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/console with false when close is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.close()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/console')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should trim the value and set the stack value when show_stack is called without a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(local.detail).toEqual(false)

    const stack = ' Test Message '
    await local.show_stack(stack)

    expect(stack.trim()).toBe('Test Message')
    expect(local.stack).toBe('Test Message')
  })

  it('should trim the value and not set detail to true when show_stack is called without a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(local.detail).toEqual(false)

    const stack = '  '
    await local.show_stack(stack)

    expect(stack.trim()).toBe('')
    expect(local.detail).toEqual(false)
  })

  it('should trim the value and set detail to true when show_stack is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(local.detail).toEqual(false)

    const stack = ' Test Message '
    await local.show_stack(stack)

    expect(stack.trim()).not.toBe('')
    expect(local.detail).toEqual(true)
  })

  it('should output formatted date when format_date is called with a DateTime value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(local.detail).toEqual(false)

    const string = await local.format_date(DateTime.now())

    expect(string).toBeDefined()
    expect(string).not.toBe('')
  })

  it('should remove newlines when format_message is called with a value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Console

    expect(local.detail).toEqual(false)

    const value = 'Test\n\r\n\rValue\n\r'
    const string = await local.format_message(value)

    expect(string).not.toBe('')
    expect(string.indexOf('\n')).toBe(-1)
    expect(string.indexOf('\r')).toBe(-1)
  })
})
