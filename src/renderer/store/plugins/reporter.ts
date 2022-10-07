export default store => {
  const dispatch = store.dispatch
  store.dispatch = async (...parameters) => {
    return new Promise(resolve => resolve(dispatch(...parameters)))
      .catch((error) => {
        dispatch('error', error)
        // throw error
      })
  }
}
