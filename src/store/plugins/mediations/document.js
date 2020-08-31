export default store => {
  store.watch(state => state.files.tree?.timestamp || 0, () => {
    store.dispatch('search/index', { tree: store.state.files.tree })
  })
}
