import 'vuetify/styles'
import { createVuetify } from 'vuetify'

function hydrate_colors (vuetify, object) {
  for (const theme of [ 'light', 'dark' ]) {
    object[theme] = {}

    for (const color in vuetify.theme.computedThemes.value[theme].colors) {
      object[theme][color] = vuetify.theme.computedThemes.value[theme].colors[color]
    }
  }
}

export const baseline: {
  light: { [key: string]: string }
  dark: { [key: string]: string }
} = {
  light: {},
  dark: {},
}

hydrate_colors(createVuetify(), baseline)

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          'surface': '#F6F6F6',
          'rendered-background': baseline.light['background'],
          'rendered-header-1': baseline.light['on-background'],
          'rendered-header-2': baseline.light['on-background'],
          'rendered-header-3': baseline.light['on-background'],
          'rendered-header-4': baseline.light['on-background'],
          'rendered-header-5': baseline.light['on-background'],
          'rendered-header-6': baseline.light['on-background'],
          'rendered-content': baseline.light['on-background'],
          'rendered-anchor': baseline.light['primary'],
          'compose-background': baseline.light['background'],
          'compose-header-1': baseline.light['on-background'],
          'compose-header-2': baseline.light['on-background'],
          'compose-header-3': baseline.light['on-background'],
          'compose-header-4': baseline.light['on-background'],
          'compose-header-5': baseline.light['on-background'],
          'compose-header-6': baseline.light['on-background'],
          'compose-content': baseline.light['on-background'],
          'compose-anchor': baseline.light['primary'],
          'compose-gutters': baseline.light['surface'],
          'compose-line-numbers': baseline.light['on-surface'],
        },
      },
      dark: {
        dark: true,
        colors: {
          'rendered-background': baseline.dark['background'],
          'rendered-header-1': baseline.dark['on-background'],
          'rendered-header-2': baseline.dark['on-background'],
          'rendered-header-3': baseline.dark['on-background'],
          'rendered-header-4': baseline.dark['on-background'],
          'rendered-header-5': baseline.dark['on-background'],
          'rendered-header-6': baseline.dark['on-background'],
          'rendered-content': baseline.dark['on-background'],
          'rendered-anchor': baseline.dark['primary'],
          'compose-background': baseline.dark['background'],
          'compose-header-1': baseline.dark['on-background'],
          'compose-header-2': baseline.dark['on-background'],
          'compose-header-3': baseline.dark['on-background'],
          'compose-header-4': baseline.dark['on-background'],
          'compose-header-5': baseline.dark['on-background'],
          'compose-header-6': baseline.dark['on-background'],
          'compose-content': baseline.dark['on-background'],
          'compose-anchor': baseline.dark['primary'],
          'compose-gutters': baseline.dark['surface'],
          'compose-line-numbers': baseline.dark['on-surface'],
        },
      },
    },
  },
})

export const presets: {
  light: { [key: string]: string }
  dark: { [key: string]: string }
} = {
  light: {},
  dark: {},
}

hydrate_colors(vuetify, presets)

export default vuetify
