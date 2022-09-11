export default store => {
  store.watch(state => state.system.signature.name, async (value) => {
    store.dispatch('tome/signature/name', value)
  })

  store.watch(state => state.system.signature.email, async (value) => {
    store.dispatch('tome/signature/email', value)
  })

  store.watch(state => state.system.signature.message, async (value) => {
    store.dispatch('tome/signature/message', value)
  })

  store.watch(state => state.system.credentials.private_key, async (value) => {
    store.dispatch('tome/credentials/private_key', value)
  })

  store.watch(state => state.system.credentials.passphrase, async (value) => {
    store.dispatch('tome/credentials/passphrase', value)
  })

  store.watch(state => state.tome.credentials.key, async (value) => {
    store.dispatch('tome/remote')
  })

  store.watch(state => state.tome.credentials.passphrase, async (value) => {
    store.dispatch('tome/remote')
  })
}
