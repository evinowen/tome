import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import { remote } from 'electron'

import store from '@/store'
import SearchService from '@/components/SearchService.vue'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

const _path = {
  relative: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'path': return _path
  }
})

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {
    tome: {
      name: 'project',
      path: '/project'
    },
    configuration: {
      format_titles: false
    },
    files: {
      active: null,
      content: null,
      error: null,
      tree: {}
    },
    search: {
      index: null,
      query: null,
      results: null,
      navigation: {
        target: 0,
        total: 0
      }
    }
  },
  dispatch: jest.fn()
}))

describe('SearchService', () => {
  let vuetify

  const factory = assemble(SearchService).context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should execute a search against the search module when a query is inputted', async () => {
    const query = 'test query'

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.update(query)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('search/query')
  })

  it('should instruct search module to navigate to next result when next is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.next()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('search/next')
  })

  it('should instruct search module to navigate to previous result when previous is called', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.previous()

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('search/previous')
  })

  it('should find the path relative to the root tome directory when a path is passed to relative', async () => {
    const path = '/project/path/to/file'

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.relative(path)

    expect(_path.relative).toHaveBeenCalledTimes(1)
    expect(_path.relative.mock.calls[0][0]).toBe('/project')
    expect(_path.relative.mock.calls[0][1]).toBe('/project/path/to/file')
  })

  it('should instruct file module to select a result when select is called', async () => {
    const path = '/project/path/to/file'

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.select(path)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/select')
  })
})
