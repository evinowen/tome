import Vue from 'vue'

export class ThemeColorPickerProperties extends Vue {
  enabled: boolean
  value: string
  color: string
  base: string
}

export default class ThemeColorPicker extends ThemeColorPickerProperties {}
