import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'

import SystemBar from '@/components/SystemBar.vue'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

jest.mock('@/store', () => ({
  state: {
    tome: {
      name: 'Test Title'
    }
  },
  dispatch: jest.fn()
}))

describe('SystemBar.vue', () => {
  const title = 'Test Title'

  let vuetify

  const factory = assemble(SystemBar, { title })
    .context(() => ({ vuetify, stubs: { VIcon: true } }))
    .hook(({ context }) => {
      vuetify = new Vuetify()
    })

  afterEach(async () => {
    await window.api.maximize_window()
    jest.clearAllMocks()
  })

  it('renders props.title when passed', () => {
    const wrapper = factory.wrap()

    expect(wrapper.find('[system-bar-title]').text()).toEqual(title)
  })

  it('calls method to close the application window when close button is clicked', async () => {
    const wrapper = factory.wrap()

    wrapper.find('[system-bar-close]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(window.api.close_window).toHaveBeenCalledTimes(1)
  })

  it('calls method to minimize the application window when minimize button is clicked', async () => {
    const wrapper = factory.wrap()

    wrapper.find('[system-bar-minimize]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(window.api.minimize_window).toHaveBeenCalledTimes(1)
  })

  it('calls method to maximize the application window when maximize button is clicked and window is not maximized', async () => {
    const wrapper = factory.wrap()

    window.api.minimize_window()

    wrapper.find('[system-bar-maximize]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(window.api.restore_window).toHaveBeenCalledTimes(0)
    expect(window.api.maximize_window).toHaveBeenCalledTimes(1)
  })

  it('calls method to restore the application window when maximize button is clicked and window is maximized', async () => {
    const wrapper = factory.wrap()

    wrapper.find('[system-bar-maximize]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(window.api.restore_window).toHaveBeenCalledTimes(1)
    expect(window.api.maximize_window).toHaveBeenCalledTimes(0)
  })
})
