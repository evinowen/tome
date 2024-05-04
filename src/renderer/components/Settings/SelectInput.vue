<template>
  <setting-frame
    :label="label"
    :detail="detail"
  >
    <v-select
      density="compact"
      :disabled="disabled"
      hide-details
      :items="options"
      item-title="label"
      item-value="value"
      :model-value="value"
      @update:model-value="debounce_update"
    />
  </setting-frame>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VSelect,
} from 'vuetify/components'

export interface Option {
  value: string
  label: string
}

export default {
  components: {
    SettingFrame,
    VSelect,
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
  disabled: boolean
  options: Option[]
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
  disabled: false,
  options: () => ([] as Option[]),
})

const value = computed<string>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: value })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
