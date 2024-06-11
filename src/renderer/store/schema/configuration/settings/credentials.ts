import { z } from 'zod'

export default z.object({
  type: z.coerce.string(),
  username: z.coerce.string(),
  password: z.coerce.string(),
  prompt_password: z.coerce.boolean(),
  key: z.coerce.string(),
  passphrase: z.coerce.string(),
  prompt_passphrase: z.coerce.boolean(),
})
