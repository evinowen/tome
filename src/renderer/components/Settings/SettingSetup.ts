import { computed } from 'vue'
import { throttle, get } from 'lodash'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'

export interface SettingProperties {
  frame?: boolean
  index: string
  label: string
  detail?: string
  localizer?: string
  target?: SettingsTarget
}

export const SettingPropertiesDefaults = () => ({
  frame: true,
  index: '',
  label: '',
  detail: '',
  localizer: '',
  target: undefined,
})

export default function SettingSetup<T> (properties, timeout, empty: T) {
  const configuration = fetch_configuration_store()

  const target = computed<SettingsTarget>(() => properties.target || configuration.target)
  const model = computed<T>(() => get(configuration[target.value], properties.index))
  const local = computed(() => target.value === SettingsTarget.Local)
  const color = computed(() => local.value ? 'secondary' : 'primary')
  const disabled = computed(() => local.value && !get(configuration.localized, properties.localizer || properties.index))

  const update = throttle(async (value: T) => {
    await configuration.update(target.value, properties.index, value ?? empty)
  }, timeout)

  return {
    color,
    disabled,
    local,
    model,
    update,
  }
}
