export default (store) => {
  store.watch((state) => state.system.commit, async () => {
    if (!store.state.system.commit) {
      await store.dispatch('system/commit_confirm', false)
    }
  })

  store.watch((state) => state.system.push, async () => {
    if (!store.state.system.push) {
      await store.dispatch('system/push_confirm', false)
    }
  })

  store.watch((state) => state.system.edit, async () => {
    if (!store.state.system.edit) {
      await store.dispatch('system/commit', false)
      await store.dispatch('system/push', false)
    }
  })

  store.watch((state) => state.repository.path || '', async () => {
    if (store.state.repository.path === '') {
      await store.dispatch('system/edit', false)
      await store.dispatch('system/commit', false)
      await store.dispatch('system/push', false)
      await store.dispatch('system/search', false)
    }
  })
}
