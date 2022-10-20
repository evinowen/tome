import Vue from 'vue'

jest.mock('vue', () => jest.fn())
jest.mock('vue-codemirror', () => ({}))
jest.mock('vue-splitpane', () => ({}))

jest.mock('@/components/App.vue', () => ({}))
jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))
jest.mock('@/vuetify', () => ({}))

const mocked_Vue = jest.mocked(Vue)
const mocked_vue_instance = { $mount: jest.fn() }
mocked_Vue.mockImplementation((options) => {
  const { render } = options

  // eslint-disable-next-line unicorn/no-useless-undefined
  render((app) => undefined, undefined)

  return mocked_Vue as unknown as Vue
})

// Vue.config = {}

describe('main', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', async () => {
    let promise: Promise<void>
    jest.isolateModules(() => { promise = require('@/main') })

    await promise
  })
})
