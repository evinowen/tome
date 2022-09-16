import action from './mediations/action'
import metadata from './mediations/metadata'
import template from './mediations/template'
import identity from './mediations/identity'

const mediations = [
  action,
  identity,
  metadata,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
