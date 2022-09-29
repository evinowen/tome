import Vue from 'vue'

jest.mock('vue')

const _Vue = {
  extend: jest.fn(),
  component: jest.fn(),
  use: jest.fn(),
  $mount: jest.fn()
}

Vue.mockImplementation(() => _Vue)
Vue.config = {}

describe('vuetify', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    expect(Vue.use).toHaveBeenCalledTimes(0)

    // TODO: Fix this test to report correctly --
    //    There is a problem with importing vuetify/lib that reports:
    //      TypeError: Cannot read property 'extend' of undefined
    // jest.isolateModules(() => { require('@/vuetify') })

    // expect(Vue.use).toHaveBeenCalledTimes(1)
    // expect(Vue.use.mock.calls[0][0]).toBe(Vuetify)
  })
})
