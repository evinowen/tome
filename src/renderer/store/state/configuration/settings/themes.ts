import ThemeStateDefaults, { State as ThemeState } from './themes/theme'

export interface State {
  dark: ThemeState
  light: ThemeState
}

export default (): State => ({
  dark: ThemeStateDefaults(),
  light: ThemeStateDefaults(),
})
