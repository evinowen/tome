<template>
  <setting-frame
    :label="label"
    :detail="detail"
    :index="index"
    :frame="frame"
  >
    <select-button-input
      ref="input-field"
      :value="model"
      :options="options"
      :color="disabled ? 'surface' : color"
      :disabled="disabled"
      @update="update"
    />
  </setting-frame>
</template>

<script lang="ts">
import { Option as SelectButtonInputOption } from '@/components/Input/SelectButtonInput.vue'
export type Option = SelectButtonInputOption
</script>

<script setup lang="ts">
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'
import SelectButtonInput from '@/components/Input/SelectButtonInput.vue'
import SettingFrame from './SettingFrame.vue'

interface Properties extends SettingProperties {
  options: Option[]
}

const properties = withDefaults(defineProps<Properties>(), {
  ...SettingPropertiesDefaults(),
  options: () => ([] as Option[]),
})

const { color, disabled, update, model } = SettingSetup<string>(properties, 0)

defineExpose({
  update,
})
</script>
