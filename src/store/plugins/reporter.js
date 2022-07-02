export default store => {
  const dispatch = store.dispatch
  store.dispatch = (type, ...params) => {
    return dispatch.apply(store, [type, ...params]).catch((error) => {
      // console.error(error)
      // console.trace()
      store.dispatch('error', error.message)
    })
  }
}
