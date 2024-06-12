import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import ThemeColorPicker, { Color } from '@/components/ThemeEditor/ThemeColorPicker.vue'

vi.mock('@/vuetify', () => ({
  presets: {
    light: {
      background: 'preset-value',
    },
  },
}))

const theme = 'light'
const section = 'application'
const colors: Color[] = [
  { label: 'Background', index: 'background' },
]

Component('components/ThemeEditor/ThemeColorPicker', ThemeColorPicker, { theme, section, colors })
  .stub({
    ThemeColorPickerOption: BasicComponent,
    VCol: BasicComponent,
    VColorPicker: BasicComponent,
    VContainer: BasicComponent,
    VList: BasicComponent,
    VRow: BasicComponent,
  })
  .run(async (factory) => {
    it('should set internal model value to preset value when no value is found in configuration', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = ''

      const wrapper = factory.wrap()

      wrapper.vm.index = 'background'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.model).toEqual('preset-value')
    })

    it('should set internal model value to configuration value when a value is found in configuration', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()

      wrapper.vm.index = 'background'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.model).toEqual('#FF0000')
    })

    it('should update internal model value when the computed value changes', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()

      wrapper.vm.index = 'background'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.model).toEqual('#FF0000')

      configuration.global.themes.light.application.background = '#FFFFFF'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.model).toEqual('#FFFFFF')
    })

    it('should call configuration.update with new value upon call to change method', async () => {
      const configuration = fetch_configuration_store()
      configuration.target = SettingsTarget.Global
      configuration.global.themes.light.application.background = '#FF0000'

      const wrapper = factory.wrap()

      wrapper.vm.index = 'background'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.model).toEqual('#FF0000')

      await wrapper.vm.change('#000000')
      const path = `themes.${theme}.${section}.background`
      expect(configuration.update).toHaveBeenCalledWith(SettingsTarget.Global, path, '#000000')
    })
  })
