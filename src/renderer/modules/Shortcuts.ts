import { fetch_system_store } from '@/store/modules/system'

export function operate () {
  const system = fetch_system_store()

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
          return await system.page({ [layer]: false })
        }
      }

      return await system.page({ settings: true })
    }

    static async layer (layer) {
      return await system.page({ [layer]: !system[layer] })
    }

    static async perform (performance) {
      await system.perform(performance)
    }
  }
}
