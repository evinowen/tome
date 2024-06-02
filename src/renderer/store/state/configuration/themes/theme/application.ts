export interface State {
  font_family_content: string
  font_family_monospace: string
  font_family_title: string
  font_size_content: number
  font_size_monospace: number
  font_size_title: number
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  warning: string
  success: string
}

export default (): State => ({
  font_family_content: '',
  font_family_title: '',
  font_family_monospace: '',
  font_size_content: 1,
  font_size_monospace: 1,
  font_size_title: 1,
  background: '',
  surface: '',
  primary: '',
  secondary: '',
  accent: '',
  error: '',
  info: '',
  warning: '',
  success: '',
})
