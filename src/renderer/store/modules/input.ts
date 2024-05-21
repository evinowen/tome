import select, { State as SelectState } from './input/select'

export interface State {
  select?: SelectState
}

export default {
  namespaced: true,
  modules: {
    select,
  },
}
