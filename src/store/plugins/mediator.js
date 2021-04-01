import document from './mediations/document'
import template from './mediations/template'

const mediations = [
  document,
  template
]

export default store => mediations.forEach(mediation => mediation(store))
