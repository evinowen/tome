import { z } from 'zod'

export default z.object({
  font_family_header: z.coerce.string(),
  font_family_content: z.coerce.string(),
  font_size_header: z.coerce.number(),
  font_size_content: z.coerce.number(),
  background: z.coerce.string(),
  header_1: z.coerce.string(),
  header_2: z.coerce.string(),
  header_3: z.coerce.string(),
  header_4: z.coerce.string(),
  header_5: z.coerce.string(),
  header_6: z.coerce.string(),
  content: z.coerce.string(),
  anchor: z.coerce.string(),
  selection: z.coerce.string(),
  highlight: z.coerce.string(),
  highlight_focus: z.coerce.string(),
})
