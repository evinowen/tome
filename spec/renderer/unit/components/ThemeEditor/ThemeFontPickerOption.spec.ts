import { it, expect } from 'vitest'
import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import ThemeFontPickerOption from '@/components/ThemeEditor/ThemeFontPickerOption.vue'

const theme = 'light'
const section = 'application'
const label = 'Content'
const index = 'content'

Component('components/ThemeEditor/ThemeFontPickerOption', ThemeFontPickerOption, { theme, section, label, index })
  .stub({
    VCard: BasicComponent,
    VCardTitle: BasicComponent,
    VColorPicker: BasicComponent,
    VSwitch: BooleanComponent,
  })
  .run(async (factory) => {
    it('should call configuration.update with new value upon call to update_family', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.font_family_content = 'Garamond'

      const wrapper = factory.wrap()

      const value = 'Times New Roman'
      await wrapper.vm.update_family(value)

      const path = `themes.${theme}.${section}.font_family_${index}`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, value)
    })

    it('should call configuration.update with new value upon call to update_size', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.font_size_content = 10

      const wrapper = factory.wrap()

      const value = 100
      await wrapper.vm.update_size(value)

      const path = `themes.${theme}.${section}.font_size_${index}`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, value)
    })
  })
