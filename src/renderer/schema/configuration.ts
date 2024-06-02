import { z } from 'zod'
import ThemesSchema from './configuration/themes'

export default z.object({
  name: z.string(),
  email: z.string(),

  credential_type: z.string(),
  username: z.string(),
  password: z.string(),
  private_key: z.string(),
  public_key: z.string(),
  passphrase: z.string(),

  default_remote: z.string(),
  auto_commit: z.boolean(),
  auto_commit_interval: z.string(),
  auto_push: z.boolean(),

  format_explorer_titles: z.boolean(),
  format_interaction_titles: z.boolean(),

  system_objects: z.boolean(),
  draggable_objects: z.boolean(),
  dark_mode: z.boolean(),
  line_numbers: z.boolean(),

  explorer_position: z.string(),
  explorer_width: z.number(),
  explorer_resize_width: z.number(),

  search_opacity: z.number(),
  search_height: z.number(),
  search_resize_height: z.number(),

  log_level: z.string(),

  themes: ThemesSchema,
})
