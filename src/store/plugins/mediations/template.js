export default store => {
  store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case 'templates/complete':
        store.dispatch('files/load', { path: state.templates.last.path })
        break
    }
  })
}
