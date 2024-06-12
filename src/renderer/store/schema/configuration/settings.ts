import { z } from 'zod'
import SignatureSchema from './settings/signature'
import CredentialsSchema from './settings/credentials'
import ThemesSchema from './settings/themes'

export default z.object({
  signature: SignatureSchema,
  credentials: CredentialsSchema,

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
