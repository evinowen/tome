import { z } from 'zod'

export default z.object({
  font_family_content: z.coerce.string(),
  font_family_monospace: z.coerce.string(),
  font_family_title: z.coerce.string(),
  font_size_content: z.coerce.number(),
  font_size_monospace: z.coerce.number(),
  font_size_title: z.coerce.number(),
  background: z.coerce.string(),
  surface: z.coerce.string(),
  primary: z.coerce.string(),
  secondary: z.coerce.string(),
  accent: z.coerce.string(),
  error: z.coerce.string(),
  info: z.coerce.string(),
  warning: z.coerce.string(),
  success: z.coerce.string(),
})
