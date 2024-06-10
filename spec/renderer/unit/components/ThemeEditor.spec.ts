import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_system_store } from '@/store/modules/system'
import ThemeEditor from '@/components/ThemeEditor.vue'

const theme = 'active'

Component('components/ThemeEditor', ThemeEditor, { theme })
  .stub({
    ApplicationThemeEditor: BasicComponentStub,
    ComposeThemeEditor: BasicComponentStub,
    RenderedThemeEditor: BasicComponentStub,
    SelectButtonInput: BasicComponentStub,
    UtilityPage,
    VIcon: BasicComponentStub,
    VTab: BasicComponentStub,
    VTabs: BasicComponentStub,
    VWindow: BasicComponentStub,
    VWindowItem: BasicComponentStub,
  })
  .run(async (factory) => {
    it('should call system.page with false theme_editor flag when close is called', async () => {
      const system = fetch_system_store()

      const wrapper = factory.wrap()
      await wrapper.vm.close()

      expect(system.page).toHaveBeenCalledWith({ theme_editor: false })
    })

    it('should set active true when system.page theme_editor flag becomes true', async () => {
      const system = fetch_system_store()

      const wrapper = factory.wrap()
      wrapper.vm.active = false

      system.theme_editor = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.active).toEqual(true)
    })

    it('should set theme to dark when active is true and dark_mode is enabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: true }

      const wrapper = factory.wrap()
      wrapper.vm.active = true

      expect(wrapper.vm.theme).toEqual('dark')
    })

    it('should set theme to light when active is true and dark_mode is disabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: false }

      const wrapper = factory.wrap()
      wrapper.vm.active = true

      expect(wrapper.vm.theme).toEqual('light')
    })

    it('should set theme to dark when active is false and theme_select is dark', async () => {
      const wrapper = factory.wrap()
      wrapper.vm.active = false
      wrapper.vm.theme_select = 'dark'

      expect(wrapper.vm.theme).toEqual('dark')
    })

    it('should set theme to light when active is false and theme_select is light', async () => {
      const wrapper = factory.wrap()
      wrapper.vm.active = false
      wrapper.vm.theme_select = 'light'

      expect(wrapper.vm.theme).toEqual('light')
    })

    it('should set theme_select to dark when active becomes true and dark_mode is enabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: true }

      const wrapper = factory.wrap()
      wrapper.vm.active = false
      wrapper.vm.theme_select = 'light'
      await wrapper.vm.$nextTick()

      wrapper.vm.active = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.theme_select).toEqual('dark')
    })

    it('should set theme_select to light when active becomes true and dark_mode is disabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: false }

      const wrapper = factory.wrap()
      wrapper.vm.active = false
      wrapper.vm.theme_select = 'dark'
      await wrapper.vm.$nextTick()

      wrapper.vm.active = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.theme).toEqual('light')
    })
  })
