export default store => {
  store.watch(state => state.repository.path || '', async () => {
    await store.dispatch('templates/load', { path: store.state.repository.path })
  })
}
