import Vue from 'vue'

jest.mock('vue')
jest.mock('vue-codemirror', () => ({}))
jest.mock('vue-splitpane', () => ({}))

jest.mock('@/App.vue', () => ({}))
jest.mock('@/router', () => ({}))
jest.mock('@/store', () => ({}))
jest.mock('@/plugins/vuetify', () => ({}))

jest.mock('@/components/Explorer.vue', () => ({}))
jest.mock('@/components/ExplorerDirectory.vue', () => ({}))
jest.mock('@/components/ExplorerFile.vue', () => ({}))

const _Vue = {
  component: jest.fn(),
  use: jest.fn(),
  $mount: jest.fn(),
  _createElement: jest.fn()
}

Vue.mockImplementation((options) => {
  const { render } = options

  render(_Vue._createElement)

  return _Vue
})

Vue.config = {}

describe('main.js', () => {
  beforeEach(() => {
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    jest.isolateModules(() => { require('@/main.js') })

    expect(_Vue._createElement).toHaveBeenCalledTimes(1)
    expect(_Vue.$mount).toHaveBeenCalledTimes(1)
  })
})
