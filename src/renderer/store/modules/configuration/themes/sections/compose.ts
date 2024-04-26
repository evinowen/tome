import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'

export const Schema = z.object({
  font_family_editor: z.coerce.string().optional(),
  font_size_editor: z.coerce.number().optional(),
  background: z.coerce.string().optional(),
  header_1: z.coerce.string().optional(),
  header_2: z.coerce.string().optional(),
  header_3: z.coerce.string().optional(),
  header_4: z.coerce.string().optional(),
  header_5: z.coerce.string().optional(),
  header_6: z.coerce.string().optional(),
  content: z.coerce.string().optional(),
  anchor: z.coerce.string().optional(),
  gutters: z.coerce.string().optional(),
  line_numbers: z.coerce.string().optional(),
})

export interface State {
  font_family_editor: string
  font_size_editor: string
  background: string
  header_1: string
  header_2: string
  header_3: string
  header_4: string
  header_5: string
  header_6: string
  content: string
  anchor: string
  gutters: string
  line_numbers: string
}

export const StateDefaults = (): State => ({
  font_family_editor: '',
  font_size_editor: 1,
  background: '',
  header_1: '',
  header_2: '',
  header_3: '',
  header_4: '',
  header_5: '',
  header_6: '',
  content: '',
  anchor: '',
  gutters: '',
  line_numbers: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
}
