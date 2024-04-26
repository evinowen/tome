import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'

export const Schema = z.object({
  font_family_content: z.coerce.string().optional(),
  font_family_monospace: z.coerce.string().optional(),
  font_family_title: z.coerce.string().optional(),
  font_size_content: z.coerce.number().optional(),
  font_size_monospace: z.coerce.number().optional(),
  font_size_title: z.coerce.number().optional(),
  background: z.coerce.string().optional(),
  surface: z.coerce.string().optional(),
  primary: z.coerce.string().optional(),
  secondary: z.coerce.string().optional(),
  accent: z.coerce.string().optional(),
  error: z.coerce.string().optional(),
  info: z.coerce.string().optional(),
  warning: z.coerce.string().optional(),
  success: z.coerce.string().optional(),
})

export interface State {
  font_family_content: string
  font_family_monospace: string
  font_family_title: string
  font_size_content: string
  font_size_monospace: string
  font_size_title: string
  background: string
  surface: string
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  warning: string
  success: string
}

export const StateDefaults = (): State => ({
  font_family_content: '',
  font_family_title: '',
  font_family_monospace: '',
  font_size_content: 1,
  font_size_monospace: 1,
  font_size_title: 1,
  background: '',
  surface: '',
  primary: '',
  secondary: '',
  accent: '',
  error: '',
  info: '',
  warning: '',
  success: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
}
