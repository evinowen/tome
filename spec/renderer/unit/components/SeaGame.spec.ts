import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import SeaGame from '@/components/SeaGame.vue'

describe('components/SeaGame', () => {
  let vuetify

  const factory = assemble(SeaGame)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      }
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should clear timer on component unmount', async () => {
    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')

    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()

    wrapper.unmount()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.ticker)
  })

  it('should fire a cannon ball when the sea is clicked', async () => {
    const wrapper = factory.wrap()
    expect(wrapper.vm.cannon.ball.sunk).toBe(true)

    const sea = wrapper.find({ref: 'sea'})
    expect(sea.exists()).toBe(true)

    const event = {
      clientX: 64,
      clientY: 64,
    }

    await sea.trigger('click', event)

    expect(wrapper.vm.cannon.ball.sunk).toBe(false)
  })

  it('should move the cannon ball as time passes after the sea is clicked', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper.vm.cannon.ball.sunk).toBe(true)

    const sea = wrapper.find({ref: 'sea'})
    expect(sea.exists()).toBe(true)

    const event = {
      clientX: 64,
      clientY: 64,
    }

    await sea.trigger('click', event)

    expect(wrapper.vm.cannon.ball.sunk).toBe(false)

    const cannon_ball = {
      x: wrapper.vm.cannon.ball.x,
      y: wrapper.vm.cannon.ball.y,
    }

    vi.advanceTimersByTime(1000)

    expect(wrapper.vm.cannon.ball.x).not.toEqual(cannon_ball.x)
    expect(wrapper.vm.cannon.ball.y).not.toEqual(cannon_ball.y)
  })
})
