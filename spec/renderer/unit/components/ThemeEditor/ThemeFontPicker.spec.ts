import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import ThemeFontPicker, { Font } from '@/components/ThemeEditor/ThemeFontPicker.vue'

const theme = 'light'
const section = 'application'
const fonts: Font[] = [
  { label: 'Content', index: 'content' },
]

Component('components/ThemeEditor/ThemeFontPicker', ThemeFontPicker, { theme, section, fonts })
  .stub({
    ThemeFontPickerOption: BasicComponent,
    VContainer: BasicComponent,
  })
  .run(async () => { /* Empty */ })
