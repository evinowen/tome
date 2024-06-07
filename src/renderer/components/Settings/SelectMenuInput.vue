<template>
  <setting-frame
    :label="label"
    :detail="detail"
    :index="index"
  >
    <v-select
      ref="input-field"
      density="compact"
      :disabled="disabled"
      hide-details
      :items="options"
      item-title="label"
      item-value="value"
      :model-value="model"
      @update:model-value="update"
    />
  </setting-frame>
</template>

<script lang="ts">
export interface Option {
  value: string
  label: string
}
</script>

<script setup lang="ts">
import SettingFrame from './SettingFrame.vue'
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'
import {
  VSelect,
} from 'vuetify/components'

interface Properties extends SettingProperties {
  options: Option[]
}

const properties = withDefaults(defineProps<Properties>(), {
  ...SettingPropertiesDefaults(),
  options: () => ([] as Option[]),
})

const { disabled, update, model } = SettingSetup<string>(properties, 0, '')

defineExpose({
  update,
})
</script>
