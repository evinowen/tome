import { z } from 'zod'

export default z.object({
  type: z.coerce.string(),
  username: z.coerce.string(),
  password: z.coerce.string(),
  private_key: z.coerce.string(),
  public_key: z.coerce.string(),
  passphrase: z.coerce.string(),
})
