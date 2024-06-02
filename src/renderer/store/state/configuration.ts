import ThemesStateDefaults, { State as ThemesState } from './configuration/themes'

export interface State {
  name: string
  email: string

  credential_type: string
  username: string
  password: string
  private_key: string
  public_key: string
  passphrase: string

  default_remote: string
  auto_commit: boolean
  auto_commit_interval: string
  auto_push: boolean

  format_explorer_titles: boolean
  format_interaction_titles: boolean
  system_objects: boolean
  draggable_objects: boolean
  dark_mode: boolean
  line_numbers: boolean

  explorer_position: string
  explorer_width: number
  explorer_resize_width: number

  search_opacity: number
  search_height: number
  search_resize_height: number

  log_level: string

  themes: ThemesState
}

export default (): State => ({
  name: '',
  email: '',

  credential_type: 'key',
  username: '',
  password: '',
  private_key: '',
  public_key: '',
  passphrase: '',

  default_remote: 'origin',
  auto_commit: false,
  auto_commit_interval: 'hourly',
  auto_push: false,

  format_explorer_titles: true,
  format_interaction_titles: true,
  system_objects: false,
  draggable_objects: true,
  dark_mode: false,
  line_numbers: false,

  explorer_position: 'left',
  explorer_width: 320,
  explorer_resize_width: 3,

  search_opacity: 100,
  search_height: 240,
  search_resize_height: 3,

  log_level: 'info',

  themes: ThemesStateDefaults(),
})
