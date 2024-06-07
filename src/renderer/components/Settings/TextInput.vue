<template>
  <setting-frame
    :index="index"
    :frame="frame"
  >
    <text-input
      ref="input-field"
      style="width: 100%"
      :disabled="disabled"
      :error="error"
      :value="model"
      :label="label"
      :obscureable="obscureable"
      :placeholder="placeholder"
      @update="update"
    />
  </setting-frame>
</template>

<script setup lang="ts">
import TextInput from '@/components/Input/TextInput.vue'
import SettingFrame from '@/components/Settings/SettingFrame.vue'
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'

interface Properties extends SettingProperties {
  error?: boolean
  obscureable?: boolean
  // eslint-disable-next-line vue/require-default-prop
  placeholder?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  ...SettingPropertiesDefaults(),
  error: false,
  obscureable: false,
  placeholder: '',
})

const { model, disabled, update } = SettingSetup<string>(properties, 500, '')

defineExpose({
  update,
})
</script>
