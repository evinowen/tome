export default store => {
  store.watch(state => state.repository.path || '', async () => {
    await store.dispatch('actions/load', { path: store.state.repository.path })
  })
}
