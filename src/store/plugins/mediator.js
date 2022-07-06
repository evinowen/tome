import document from './mediations/document'
import metadata from './mediations/metadata'
import template from './mediations/template'

const mediations = [
  document,
  metadata,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
