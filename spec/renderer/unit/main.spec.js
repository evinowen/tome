import Vue from 'vue'

jest.mock('vue')
jest.mock('vue-codemirror', () => ({}))
jest.mock('vue-splitpane', () => ({}))

jest.mock('@/components/App', () => ({}))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))
jest.mock('@/vuetify', () => ({}))

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

describe('main', () => {
  beforeEach(() => {
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', async () => {
    let promise
    jest.isolateModules(() => { promise = require('@/main') })

    await promise

    expect(_Vue._createElement).toHaveBeenCalledTimes(1)
    expect(_Vue.$mount).toHaveBeenCalledTimes(1)
  })
})
