import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify()

export default vuetify

export const presets: {
  light: { [key: string]: string }
  dark: { [key: string]: string }
} = {
  light: {},
  dark: {},
}

for (const theme of [ 'light', 'dark' ]) {
  presets[theme] = {}

  for (const color in vuetify.theme.themes.value[theme].colors) {
    presets[theme][color] = vuetify.theme.themes.value[theme].colors[color]
  }
}
