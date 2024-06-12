import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import ThemeEditorSection, { Color, Font } from '@/components/ThemeEditor/ThemeEditorSection.vue'

const theme = 'light'
const section = 'application'
const fonts: Font[] = [
  { label: 'Content', index: 'content' },
]
const colors: Color[] = [
  { label: 'Background', index: 'background' },
]

Component('components/ThemeEditor/ThemeEditorSection', ThemeEditorSection, { theme, section, fonts, colors })
  .stub({
    VCard: BasicComponent,
    VCardTitle: BasicComponent,
    VColorPicker: BasicComponent,
    VSwitch: BooleanComponent,
  })
  .run(async () => { /* Empty */ })
