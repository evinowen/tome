export function operate(store) {
  const system = store.state.system

  return class ShortcutOperator {
    static async escape () {
      const layers = [
        'settings',
        'console',
        'patch',
        'search',
        'branch',
        'push',
        'commit',
        'edit',
      ]

      for (const layer of layers) {
        if (system[layer]) {
          return await store.dispatch(`system/${layer}`, false)
        }
      }

      return await store.dispatch('system/settings', true)
    }

    static async layer (layer) {
      return await store.dispatch(`system/${layer}`, !system[layer])
    }

    static async perform (performance) {
      await store.dispatch('system/perform', performance)
    }

    static async dispatch (action) {
      await store.dispatch(action)
    }
  }
}
