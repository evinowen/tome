import actions from './mediations/actions'
import metadata from './mediations/metadata'
import template from './mediations/template'

const mediations = [
  actions,
  metadata,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
