export default (store) => {
  const dispatch = store.dispatch
  store.dispatch = async (...parameters) => {
    return new Promise((resolve) => resolve(dispatch(...parameters)))
      .catch((error) => {
        dispatch('log', { level: 'error', message: error.message, stack: error.stack })
      })
  }
}
