import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'

export const Schema = z.object({
  font_family_compose: z.coerce.string().optional(),
  font_size_compose: z.coerce.number().optional(),
  background: z.coerce.string().optional(),
  gutters: z.coerce.string().optional(),
  line_numbers: z.coerce.string().optional(),
  content: z.coerce.string().optional(),
  comments: z.coerce.string().optional(),
  anchor: z.coerce.string().optional(),
  header_1: z.coerce.string().optional(),
  header_2: z.coerce.string().optional(),
  header_3: z.coerce.string().optional(),
  header_4: z.coerce.string().optional(),
  header_5: z.coerce.string().optional(),
  header_6: z.coerce.string().optional(),
  keywords: z.coerce.string().optional(),
  operators: z.coerce.string().optional(),
  types: z.coerce.string().optional(),
  brackets: z.coerce.string().optional(),
  strings: z.coerce.string().optional(),
  numbers: z.coerce.string().optional(),
  booleans: z.coerce.string().optional(),
  selection: z.coerce.string().optional(),
  highlight: z.coerce.string().optional(),
  highlight_focus: z.coerce.string().optional(),
})

export interface State {
  font_family_compose: string
  font_size_compose: number
  background: string
  gutters: string
  line_numbers: string
  content: string
  comments: string
  anchor: string
  header_1: string
  header_2: string
  header_3: string
  header_4: string
  header_5: string
  header_6: string
  keywords: string
  operators: string
  types: string
  brackets: string
  strings: string
  numbers: string
  booleans: string
  selection: string
  highlight: string
  highlight_focus: string
}

export const StateDefaults = (): State => ({
  font_family_compose: '',
  font_size_compose: 1,
  background: '',
  gutters: '',
  line_numbers: '',
  content: '',
  comments: '',
  anchor: '',
  header_1: '',
  header_2: '',
  header_3: '',
  header_4: '',
  header_5: '',
  header_6: '',
  keywords: '',
  operators: '',
  types: '',
  brackets: '',
  strings: '',
  numbers: '',
  booleans: '',
  selection: '',
  highlight: '',
  highlight_focus: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
}
