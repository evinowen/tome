export default store => {
  store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case 'templates/complete':
        store.dispatch('files/load', { path: state.templates.last.path })
        break
    }
  })

  store.watch(state => state.tome.path || '', async () => {
    await store.dispatch('templates/load', { path: store.state.tome.path })
  })
}
