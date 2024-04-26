import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'
import theme, { Schema as ThemeSchema, State as ThemeState } from './theme'

export const Schema = z.object({
  dark: ThemeSchema.optional(),
  light: ThemeSchema.optional(),
})

export interface State {
  dark: ThemeState
  light: ThemeState
}

export const StateDefaults = (): State => ({})

export default {
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
  modules: {
    dark: theme(),
    light: theme(),
  },
}
