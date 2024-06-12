import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import ThemeColorPickerOption from '@/components/ThemeEditor/ThemeColorPickerOption.vue'

vi.mock('@/vuetify', () => ({
  presets: {
    light: {
      background: 'preset-value',
    },
  },
}))

const theme = 'light'
const section = 'application'
const label = 'Background'
const index = 'background'

Component('components/ThemeEditor/ThemeColorPickerOption', ThemeColorPickerOption, { theme, section, label, index })
  .stub({
    VBtn: BasicComponent,
    VCheckboxBtn: BooleanComponent,
    VListItem: BasicComponent,
    VListItemAction: BasicComponent,
  })
  .run(async (factory) => {
    it('should enabled value false when no value is found in configuration', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = ''

      const wrapper = factory.wrap()
      expect(wrapper.vm.enabled).toEqual(false)
    })

    it('should enabled value true when value is found in configuration', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()
      expect(wrapper.vm.enabled).toEqual(true)
    })

    it('should call configuration.upate with preset value upon call to reset', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()
      await wrapper.vm.reset()

      const path = `themes.${theme}.${section}.${index}`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, 'preset-value')
    })

    it('should call configuration.update with preset value upon call to toggle while enabled is false', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = ''

      const wrapper = factory.wrap()
      expect(wrapper.vm.enabled).toEqual(false)

      await wrapper.vm.toggle()

      const path = `themes.${theme}.${section}.${index}`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, 'preset-value')
    })

    it('should call configuration.update with blank value upon call to toggle while enabled is true', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()
      expect(wrapper.vm.enabled).toEqual(true)

      await wrapper.vm.toggle()

      const path = `themes.${theme}.${section}.${index}`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, '')
    })
  })
