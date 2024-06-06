import { z } from 'zod'
import ThemeSchema from './themes/theme'

export default z.object({
  dark: ThemeSchema,
  light: ThemeSchema,
})
