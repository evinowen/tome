<template>
  <setting-frame
    :label="label"
    :detail="detail"
  >
    <v-text-field
      density="compact"
      suffix="px"
      style="width: 120px"
      hide-details
      :model-value="value"
      @update:model-value="debounce_update"
    />
  </setting-frame>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    SettingFrame,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import { debounce } from 'lodash'

const store = fetchStore()

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

const value = computed<number>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: Number(value) || 120 })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
