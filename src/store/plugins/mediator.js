import metadata from './mediations/metadata'
import template from './mediations/template'

const mediations = [
  metadata,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
