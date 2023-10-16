export default store => {
  store.watch(state => state.repository.path || '', async () => {
    await this.store.dispatch('actions/load', { path: this.store.state.repository.path })
  })
}
