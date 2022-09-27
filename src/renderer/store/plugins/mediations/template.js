export default store => {
  store.watch(state => state.tome.path || '', async () => {
    await store.dispatch('templates/load', { path: store.state.tome.path })
  })
}
