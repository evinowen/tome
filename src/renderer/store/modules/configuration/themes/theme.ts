import { z } from 'zod'
import Template from '@/store/modules/configuration/Template'
import application, { Schema as ApplicationSchema, State as ApplicationState } from './sections/application'
import rendered, { Schema as RenderedSchema, State as RenderedState } from './sections/rendered'
import compose, { Schema as ComposeSchema, State as ComposeState } from './sections/compose'

export const Schema = z.object({
  application: ApplicationSchema.optional(),
  rendered: RenderedSchema.optional(),
  compose: ComposeSchema.optional(),
})

export interface State {
  application?: ApplicationState
  rendered?: RenderedState
  compose?: ComposeState
}

export const StateDefaults = (): State => ({})

export default () => ({
  namespaced: true,
  state: StateDefaults,
  ...Template<State>(),
  modules: {
    application,
    rendered,
    compose,
  },
})
