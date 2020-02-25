import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote } from 'electron'

Vue.use(Vuetify)

import { mount } from '@vue/test-utils'
import SystemBar from '@/components/SystemBar.vue'

afterEach(() => {
  jest.clearAllMocks()

})

jest.mock('electron', () => ({
  remote: {
    getCurrentWindow: jest.fn(),
    BrowserWindow: {
      getFocusedWindow: jest.fn(),
    },
  },

}))

const window = {
  isMaximized: jest.fn(() => false),
  restore: jest.fn(),
  minimize: jest.fn(),
  maximize: jest.fn(),
  close: jest.fn(),
}

remote.getCurrentWindow.mockImplementation(() => window)
remote.BrowserWindow.getFocusedWindow.mockImplementation(() => window)

describe('SystemBar.vue', () => {
  it('renders props.title when passed', () => {
    const title = 'Test Title'

    const mock = mount(
      SystemBar,
      {
        propsData: { title }
      }
    )

    expect(mock.find('[system-bar-title]').text()).toEqual(title)

  })

  it('calls method to close the application window when close button is clicked', () => {
    const title = 'Test Title'

    const mock = mount(
      SystemBar,
      {
        propsData: { title }
      }
    )

    mock.find('[system-bar-close]').trigger('click')

    expect(window.close).toHaveBeenCalledTimes(1)

  })

  it('calls method to minimize the application window when minimize button is clicked', () => {
    const title = 'Test Title'

    const mock = mount(
      SystemBar,
      {
        propsData: { title }
      }
    )

    mock.find('[system-bar-minimize]').trigger('click')

    expect(window.minimize).toHaveBeenCalledTimes(1)

  })

  it('calls method to maximize the application window when maximize button is clicked and window is not maximized', () => {
    const title = 'Test Title'

    const mock = mount(
      SystemBar,
      {
        propsData: { title }
      }
    )

    window.isMaximized = jest.fn(() => false)

    mock.find('[system-bar-maximize]').trigger('click')

    expect(window.restore).toHaveBeenCalledTimes(0)
    expect(window.maximize).toHaveBeenCalledTimes(1)

  })

  it('calls method to restore the application window when maximize button is clicked and window is maximized', () => {
    const title = 'Test Title'

    const mock = mount(
      SystemBar,
      {
        propsData: { title }
      }
    )

    window.isMaximized.mockImplementation(() => true)

    mock.find('[system-bar-maximize]').trigger('click')

    expect(window.maximize).toHaveBeenCalledTimes(0)
    expect(window.restore).toHaveBeenCalledTimes(1)

  })

})
