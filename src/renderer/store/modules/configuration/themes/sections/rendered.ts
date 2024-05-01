import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'

export const Schema = z.object({
  font_family_header: z.coerce.string().optional(),
  font_family_content: z.coerce.string().optional(),
  font_size_header: z.coerce.number().optional(),
  font_size_content: z.coerce.number().optional(),
  background: z.coerce.string().optional(),
  header_1: z.coerce.string().optional(),
  header_2: z.coerce.string().optional(),
  header_3: z.coerce.string().optional(),
  header_4: z.coerce.string().optional(),
  header_5: z.coerce.string().optional(),
  header_6: z.coerce.string().optional(),
  content: z.coerce.string().optional(),
  anchor: z.coerce.string().optional(),
  selection: z.coerce.string().optional(),
  highlight: z.coerce.string().optional(),
  highlight_focus: z.coerce.string().optional(),
})

export interface State {
  font_family_header: string
  font_size_header: string
  font_family_content: string
  font_size_content: string
  background: string
  header_1: string
  header_2: string
  header_3: string
  header_4: string
  header_5: string
  header_6: string
  content: string
  anchor: string
  selection: string
  highlight: string
  highlight_focus: string
}

export const StateDefaults = (): State => ({
  font_family_header: '',
  font_family_content: '',
  font_size_header: 1,
  font_size_content: 1,
  background: '',
  header_1: '',
  header_2: '',
  header_3: '',
  header_4: '',
  header_5: '',
  header_6: '',
  content: '',
  anchor: '',
  selection: '',
  highlight: '',
  highlight_focus: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
}
