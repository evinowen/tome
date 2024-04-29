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
          'rendered-selection': baseline.light['info'],
          'rendered-highlight': baseline.light['info'],
          'rendered-highlight-focus': baseline.light['info'],
          'compose-background': baseline.light['background'],
          'compose-gutters': baseline.light['surface'],
          'compose-line-numbers': baseline.light['on-surface'],
          'compose-content': baseline.light['on-background'],
          'compose-comments': baseline.light['success'],
          'compose-anchor': baseline.light['primary'],
          'compose-header-1': baseline.light['on-background'],
          'compose-header-2': baseline.light['on-background'],
          'compose-header-3': baseline.light['on-background'],
          'compose-header-4': baseline.light['on-background'],
          'compose-header-5': baseline.light['on-background'],
          'compose-header-6': baseline.light['on-background'],
          'compose-keywords': baseline.light['primary'],
          'compose-operators': baseline.light['primary'],
          'compose-types': baseline.light['primary'],
          'compose-brackets': baseline.light['primary'],
          'compose-strings': baseline.light['secondary'],
          'compose-numbers': baseline.light['secondary'],
          'compose-booleans': baseline.light['secondary'],
          'compose-selection': baseline.light['info'],
          'compose-highlight': baseline.light['info'],
          'compose-highlight-focus': baseline.light['info'],
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
          'rendered-selection': baseline.dark['info'],
          'rendered-highlight': baseline.dark['info'],
          'rendered-highlight-focus': baseline.dark['info'],
          'compose-background': baseline.dark['background'],
          'compose-gutters': baseline.dark['surface'],
          'compose-line-numbers': baseline.dark['on-surface'],
          'compose-content': baseline.dark['on-background'],
          'compose-comments': baseline.dark['success'],
          'compose-anchor': baseline.dark['primary'],
          'compose-header-1': baseline.dark['on-background'],
          'compose-header-2': baseline.dark['on-background'],
          'compose-header-3': baseline.dark['on-background'],
          'compose-header-4': baseline.dark['on-background'],
          'compose-header-5': baseline.dark['on-background'],
          'compose-header-6': baseline.dark['on-background'],
          'compose-keywords': baseline.dark['primary'],
          'compose-operators': baseline.dark['primary'],
          'compose-types': baseline.dark['primary'],
          'compose-brackets': baseline.dark['primary'],
          'compose-strings': baseline.dark['secondary'],
          'compose-numbers': baseline.dark['secondary'],
          'compose-booleans': baseline.dark['secondary'],
          'compose-selection': baseline.dark['info'],
          'compose-highlight': baseline.dark['info'],
          'compose-highlight-focus': baseline.dark['info'],
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
