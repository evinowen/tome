export default (store) => {
  store.watch((state) => state.system.signature.name, async (value) => {
    await store.dispatch('repository/signature/name', value)
  })

  store.watch((state) => state.system.signature.email, async (value) => {
    await store.dispatch('repository/signature/email', value)
  })

  store.watch((state) => state.system.signature.message, async (value) => {
    await store.dispatch('repository/signature/message', value)
  })

  store.watch((state) => state.system.credentials.private_key, async (value) => {
    await store.dispatch('repository/credentials/private_key', value)
  })

  store.watch((state) => state.system.credentials.passphrase, async (value) => {
    await store.dispatch('repository/credentials/passphrase', value)
  })

  store.watch((state) => state.repository.credentials.key, async () => {
    await store.dispatch('repository/remote')
  })

  store.watch((state) => state.repository.credentials.passphrase, async () => {
    await store.dispatch('repository/remote')
  })
}
