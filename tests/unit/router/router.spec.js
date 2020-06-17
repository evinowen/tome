import router from '@/router'

import { createLocalVue } from '@vue/test-utils'

let localVue

describe('src/router/index.js', () => {
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(router)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('is able to be mocked and prepared for testing', async () => {
    router.push({ name: '/', params: {} })

    await localVue.nextTick()
  })
})
