import action from './mediations/action'
import metadata from './mediations/metadata'
import template from './mediations/template'
import tome from './mediations/tome'

const mediations = [
  action,
  metadata,
  template,
  tome
]

export default store => mediations.forEach(mediation => mediation(store))
