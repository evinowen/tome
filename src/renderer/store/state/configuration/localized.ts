export interface State {
  signature: boolean
  credentials: boolean

  default_remote: boolean
  auto_commit: boolean
  auto_commit_interval: boolean
  auto_push: boolean

  format_explorer_titles: boolean
  format_interaction_titles: boolean
  system_objects: boolean
  draggable_objects: boolean
  dark_mode: boolean
  line_numbers: boolean

  explorer_position: boolean
  explorer_width: boolean
  explorer_resize_width: boolean

  search_opacity: boolean
  search_height: boolean
  search_resize_height: boolean

  log_level: boolean

  themes: boolean
}

export default (): State => ({
  signature: false,
  credentials: false,

  default_remote: false,
  auto_commit: false,
  auto_commit_interval: false,
  auto_push: false,

  format_explorer_titles: false,
  format_interaction_titles: false,
  system_objects: false,
  draggable_objects: false,
  dark_mode: false,
  line_numbers: false,

  explorer_position: false,
  explorer_width: false,
  explorer_resize_width: false,

  search_opacity: false,
  search_height: false,
  search_resize_height: false,

  log_level: false,

  themes: false,
})
