<template>
  <v-btn-toggle
    ref="input-field"
    :model-value="value"
    mandatory
    :color="disabled ? 'surface' : color"
    :style="{
      'opacity': disabled ? 0.4 : 1,
    }"
    :disabled="disabled"
    divided
    elevation="2"
    @update:model-value="(value) => emit('update', value)"
  >
    <v-btn
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      density="compact"
    >
      <v-icon>{{ option.icon }}</v-icon>
    </v-btn>
  </v-btn-toggle>
</template>

<script setup lang="ts">
import {
  VBtn,
  VBtnToggle,
  VIcon,
} from 'vuetify/components'

export interface Option {
  value: string
  icon: string
  label?: string
}

interface Properties {
  value?: string
  color?: string
  disabled?: boolean
  options: Option[]
}

withDefaults(defineProps<Properties>(), {
  value: '',
  color: 'primary',
  disabled: false,
  options: () => ([] as Option[]),
})

const emit = defineEmits([
  'update',
])
</script>
