<template>
  <setting-frame
    :label="label"
    :detail="detail"
  >
    <toggle-switch
      :value="value"
      @input="debounce_update"
    />
  </setting-frame>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import ToggleSwitch from '../ToggleSwitch.vue'

export default {
  components: {
    SettingFrame,
    ToggleSwitch,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { debounce } from 'lodash'

const configuration = fetch_configuration_store()

interface Properties {
  label: string
  detail: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
})

const value = computed<boolean>(() => configuration[properties.index])

async function update (value: boolean) {
  await configuration.update({ [properties.index]: value })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
