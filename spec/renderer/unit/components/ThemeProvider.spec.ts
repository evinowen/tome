import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import ThemeProvider from '@/components/ThemeProvider.vue'

const theme = 'active'

Component('components/ThemeProvider', ThemeProvider, { theme })
  .stub({
    VThemeProvider: BasicComponent,
    VSheet: BooleanComponent,
  })
  .run(async (factory) => {
    it('should set view_theme to dark when theme is set to active and dark_mode is enabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: true }

      const wrapper = factory.wrap({ theme: 'active' })
      expect(wrapper.vm.view_theme).toEqual('dark')
    })

    it('should set view_theme to dark when theme is set to active and dark_mode is disabled', async () => {
      const configuration = fetch_configuration_store()
      // @ts-expect-error: Getter is read only
      configuration.active = { dark_mode: false }

      const wrapper = factory.wrap({ theme: 'active' })
      expect(wrapper.vm.view_theme).toEqual('light')
    })

    it('should set view_theme to dark-global when theme is set to dark and configuration target is SettingsTarget.Global', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global

      const wrapper = factory.wrap({ theme: 'dark' })
      expect(wrapper.vm.view_theme).toEqual('dark-global')
    })

    it('should set view_theme to dark-local when theme is set to dark and configuration target is SettingsTarget.Local', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Local

      const wrapper = factory.wrap({ theme: 'dark' })
      expect(wrapper.vm.view_theme).toEqual('dark-local')
    })

    it('should set view_theme to light-global when theme is set to light and configuration target is SettingsTarget.Global', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global

      const wrapper = factory.wrap({ theme: 'light' })
      expect(wrapper.vm.view_theme).toEqual('light-global')
    })

    it('should set view_theme to light-local when theme is set to light and configuration target is SettingsTarget.Local', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Local

      const wrapper = factory.wrap({ theme: 'light' })
      expect(wrapper.vm.view_theme).toEqual('light-local')
    })
  })
