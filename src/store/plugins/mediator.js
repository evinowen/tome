import document from './mediations/document'

const mediations = [
  document
]

export default store => mediations.forEach(mediation => mediation(store))
