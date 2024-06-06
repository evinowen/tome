<template>
  <setting-frame
    :label="label"
    :detail="detail"
    :index="index"
    :frame="frame"
  >
    <toggle-switch
      ref="input-field"
      :value="model"
      :disabled="disabled"
      :color="color"
      @update="update"
    />
  </setting-frame>
</template>

<script setup lang="ts">
import SettingFrame from './SettingFrame.vue'
import ToggleSwitch from '@/components/Input/ToggleSwitch.vue'

import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'

const properties = withDefaults(defineProps<SettingProperties>(), SettingPropertiesDefaults())

const { color, disabled, update, model } = SettingSetup<boolean>(properties, 0)

defineExpose({
  update,
})
</script>
