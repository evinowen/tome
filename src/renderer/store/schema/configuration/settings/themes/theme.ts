import { z } from 'zod'
import ApplicationSchema from './theme/application'
import RenderedSchema from './theme/rendered'
import ComposeSchema from './theme/compose'

export default z.object({
  application: ApplicationSchema,
  rendered: RenderedSchema,
  compose: ComposeSchema,
})
