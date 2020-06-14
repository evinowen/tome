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
  $mount: jest.fn()
}

Vue.mockImplementation(() => _Vue)
Vue.config = {}

describe('main.js', () => {
  beforeEach(() => {
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', () => {
    jest.isolateModules(() => { require('@/main.js') })

    expect(_Vue.$mount).toHaveBeenCalledTimes(1)
  })
})
