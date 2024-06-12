import { reactive, ref, watch, WatchStopHandle } from 'vue'
import { debounce } from 'lodash'
import api from '@/api'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'

const handles: WatchStopHandle[] = []
const loaded = ref(false)
const data = reactive({
  global: {
    error: false,
    data: '',
  },
  local: {
    error: false,
    data: '',
  },
})

export function reset () {
  while (handles.length > 0) {
    handles.pop()()
  }

  loaded.value = false
}

export default function PublicKey () {
  if (!loaded.value) {
    reset()

    const log = fetch_log_store()
    const configuration = fetch_configuration_store()

    const update = async (target) => {
      if (configuration[target].credentials.prompt_passphrase) {
        data[target].error = false
        data[target].data = ''
      } else {
        try {
          const result = await api.ssl.generate_public_key(
            configuration[target].credentials.key,
            configuration[target].credentials.passphrase,
          )

          if (result.error) {
            data[target].error = true
            data[target].data = result.error
            return
          }

          data[target].error = false
          data[target].data = result.data
        } catch (error) {
          log.error(error, error.stack)
        }
      }
    }

    const update_global = debounce(() => update(SettingsTarget.Global), 500)
    const update_local = debounce(() => update(SettingsTarget.Local), 500)

    handles.push(
      watch(() => loaded.value, update_global),
      watch(() => configuration.global.credentials.key, update_global),
      watch(() => configuration.global.credentials.passphrase, update_global),
      watch(() => configuration.global.credentials.prompt_passphrase, update_global),
      watch(() => loaded.value, update_local),
      watch(() => configuration.local.credentials.key, update_local),
      watch(() => configuration.local.credentials.passphrase, update_local),
      watch(() => configuration.local.credentials.prompt_passphrase, update_local),
    )

    loaded.value = true
  }

  return data
}
