import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueShortKey from 'vue-shortkey'

import ShortcutService from '@/components/ShortcutService.vue'

Vue.use(Vuetify)
Vue.use(VueShortKey)

describe('Console.vue', () => {
  const factory = assemble(ShortcutService)
    .hook(({ context, localVue }) => {
      localVue.use(Vuetify)
      context.vuetify = new Vuetify()
    })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit settings event if no other flags are enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: false,
      push: false,
      commit: false,
      edit: false
    })

    wrapper.vm.$on('settings', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit settings event if settings flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: true,
      console: true,
      patch: true,
      search: true,
      branch: true,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('settings', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit console event if console flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: true,
      patch: true,
      search: true,
      branch: true,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('console', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit patch event if patch flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: true,
      search: true,
      branch: true,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('patch', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit search event if search flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: true,
      branch: true,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('search', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit branch event if branch flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: true,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('branch', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit push event if push flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: false,
      push: true,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('push', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit commit event if commit flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: false,
      push: false,
      commit: true,
      edit: true
    })

    wrapper.vm.$on('commit', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit edit event if edit flag is enabled on call to escape', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap({
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: false,
      push: false,
      commit: false,
      edit: true
    })

    wrapper.vm.$on('edit', event)

    wrapper.vm.escape()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
