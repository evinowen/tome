import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify()

export default vuetify

export const presets = {}

for (const theme of ['light', 'dark']) {
  presets[theme] = {}

  for (const color in vuetify.theme.themes.value[theme].colors) {
    presets[theme][color] = vuetify.theme.themes.value[theme].colors[color]
  }
}
