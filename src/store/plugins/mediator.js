import action from './mediations/action'
import metadata from './mediations/metadata'
import template from './mediations/template'

const mediations = [
  action,
  metadata,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
