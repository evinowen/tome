import { z } from 'zod'

export default z.object({
  name: z.coerce.string(),
  email: z.coerce.string(),
})
