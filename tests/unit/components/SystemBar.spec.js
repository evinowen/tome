import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote } from 'electron'

import { mount } from '@vue/test-utils'
import SystemBar from '@/components/SystemBar.vue'

Vue.use(Vuetify)

afterEach(() => {
  jest.clearAllMocks()
})

jest.mock('electron', () => ({
  remote: {
    getCurrentWindow: jest.fn(),
    BrowserWindow: {
      getFocusedWindow: jest.fn()
    }
  }

}))

const window = {
  isMaximized: jest.fn(() => false),
  restore: jest.fn(),
  minimize: jest.fn(),
  maximize: jest.fn(),
  close: jest.fn()
}

remote.getCurrentWindow.mockImplementation(() => window)
remote.BrowserWindow.getFocusedWindow.mockImplementation(() => window)

describe('SystemBar.vue', () => {
  const title = 'Test Title'

  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      SystemBar,
      {
        vuetify,
        propsData: { title }
      }
    )
  })

  it('renders props.title when passed', () => {
    expect(wrapper.find('[system-bar-title]').text()).toEqual(title)
  })

  it('calls method to close the application window when close button is clicked', () => {
    wrapper.find('[system-bar-close]').trigger('click')

    expect(window.close).toHaveBeenCalledTimes(1)
  })

  it('calls method to minimize the application window when minimize button is clicked', () => {
    wrapper.find('[system-bar-minimize]').trigger('click')

    expect(window.minimize).toHaveBeenCalledTimes(1)
  })

  it('calls method to maximize the application window when maximize button is clicked and window is not maximized', () => {
    window.isMaximized = jest.fn(() => false)

    wrapper.find('[system-bar-maximize]').trigger('click')

    expect(window.restore).toHaveBeenCalledTimes(0)
    expect(window.maximize).toHaveBeenCalledTimes(1)
  })

  it('calls method to restore the application window when maximize button is clicked and window is maximized', () => {
    window.isMaximized.mockImplementation(() => true)

    wrapper.find('[system-bar-maximize]').trigger('click')

    expect(window.maximize).toHaveBeenCalledTimes(0)
    expect(window.restore).toHaveBeenCalledTimes(1)
  })
})
