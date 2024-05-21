import action from './mediations/action'
import metadata from './mediations/metadata'
import template from './mediations/template'
import system from './mediations/system'

const mediations = [
  action,
  metadata,
  template,
  system,
]

export default (store) => {
  for (const mediation of mediations) {
    mediation(store)
  }
}
