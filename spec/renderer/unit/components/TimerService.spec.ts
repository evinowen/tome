import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import TimerService from '@/components/TimerService.vue'
import { SystemTimeout } from '@/store/modules/system'
import { fetch_system_store } from '@/store/modules/system'

describe('components/TimerService', () => {
  let vuetify
  let pinia

  const factory = assemble(TimerService)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should setup timers upon mounting', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    expect(wrapper.vm.sleep_ticker).toBeDefined()
    expect(wrapper.vm.minute_ticker).toBeDefined()
    expect(wrapper.vm.quarter_hour_ticker).toBeDefined()
    expect(wrapper.vm.half_hour_ticker).toBeDefined()
    expect(wrapper.vm.hour_ticker).toBeDefined()
    expect(wrapper.vm.quarter_day_ticker).toBeDefined()
    expect(wrapper.vm.half_day_ticker).toBeDefined()
    expect(wrapper.vm.day_ticker).toBeDefined()
  })

  it('should make call to clear upon unmounting', async () => {
    vi.useFakeTimers()
    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')
    const mocked_clearTimeout = vi.spyOn(global, 'clearTimeout')

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    expect(wrapper.vm.sleep_ticker).toBeDefined()
    expect(wrapper.vm.minute_ticker).toBeDefined()
    expect(wrapper.vm.quarter_hour_ticker).toBeDefined()
    expect(wrapper.vm.half_hour_ticker).toBeDefined()
    expect(wrapper.vm.hour_ticker).toBeDefined()
    expect(wrapper.vm.quarter_day_ticker).toBeDefined()
    expect(wrapper.vm.half_day_ticker).toBeDefined()
    expect(wrapper.vm.day_ticker).toBeDefined()

    wrapper.unmount()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.sleep_ticker)

    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.minute_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.quarter_hour_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.half_hour_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.hour_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.quarter_day_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.half_day_ticker)
    expect(mocked_clearTimeout).toHaveBeenCalledWith(wrapper.vm.day_ticker)
  })

  it('should dispatch system/timer for SystemTimeout.Minute after one minute has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.Minute)
  })

  it('should dispatch system/timer for SystemTimeout.QuarterHour after a quarter hour has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 15)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.QuarterHour)
  })

  it('should dispatch system/timer for SystemTimeout.HalfHour after a half hour has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 30)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.HalfHour)
  })

  it('should dispatch system/timer for SystemTimeout.Hour after an hour has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 60)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.Hour)
  })

  it('should dispatch system/timer for SystemTimeout.QuarterDay after a quarter day has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 60 * 6)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.QuarterDay)
  })

  it('should dispatch system/timer for SystemTimeout.HalfDay after a half day has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 60 * 12)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.HalfDay)
  })

  it('should dispatch system/timer for SystemTimeout.Day after a day has elapsed', async () => {
    const system = fetch_system_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    vi.advanceTimersByTime(1000 * 60 * 60 * 24)

    expect(system.timer).toHaveBeenCalledWith(SystemTimeout.Day)
  })
})
