export default store => {
  const dispatch = store.dispatch
  store.dispatch = async (...params) => {
    return new Promise(resolve => resolve(dispatch(...params))).catch((error) => dispatch('error', error))
  }
}
