import Vuex from 'vuex'
import { createLocalVue } from '@vue/test-utils'

jest.mock('@/store/modules/tome')
jest.mock('@/store/modules/configuration')

describe('src/store/index.js', () => {
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    jest.isolateModules(() => {
      const store = require('@/store').default

      expect(store.state.tome_file).toBe('')
      expect(store.state.tome_file_selected).toBe('')
      expect(store.state.tome_file_path).toBe('')
      expect(store.state.tome_file_data).toBe('')
      expect(store.state.tome_file_error).toBe('')
      expect(store.state.tome_app_config_path).toBe('')
      expect(store.state.tome_app_config_path_dir).toBe('')

      expect(store.state.tome.undefined).toBeUndefined()
    })
  })
})
