import ApplicationStateDefaults, { State as ApplicationState } from './theme/application'
import RenderedStateStateDefaults, { State as RenderedState } from './theme/rendered'
import ComposeStateStateDefaults, { State as ComposeState } from './theme/compose'

export interface State {
  application: ApplicationState
  rendered: RenderedState
  compose: ComposeState
}

export default (): State => ({
  application: ApplicationStateDefaults(),
  rendered: RenderedStateStateDefaults(),
  compose: ComposeStateStateDefaults(),
})
