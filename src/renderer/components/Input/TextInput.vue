<template>
  <div class="d-flex">
    <div class="flex-grow-1 pa-1">
      <v-text-field
        ref="input-field"
        density="compact"
        variant="solo"
        hide-details
        clearable
        :disabled="disabled"
        :error="error"
        :placeholder="placeholder"
        :label="label"
        :model-value="value"
        :type="(obscureable && obscured) ? 'password' : 'text'"
        @update:model-value="update"
      />
    </div>
    <div
      v-if="obscureable"
      class="flex-grow-0 pa-1"
    >
      <v-btn
        ref="obscure-button"
        rounded="0"
        icon
        style="height: 100%;"
        @click="obscured = !obscured"
      >
        <v-icon size="small">
          {{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}
        </v-icon>
      </v-btn>
    </div>
    <div
      v-if="!!$slots.append"
      class="flex-grow-0 pa-1"
    >
      <slot name="append" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  VBtn,
  VIcon,
  VTextField,
} from 'vuetify/components'

interface Properties {
  disabled?: boolean
  error?: boolean
  label: string
  obscureable?: boolean
  placeholder?: string
  value: string
}

withDefaults(defineProps<Properties>(), {
  disabled: false,
  error: false,
  label: '',
  obscureable: false,
  placeholder: '',
  value: '',
})

const emit = defineEmits([
  'update',
])

const obscured = ref(true)

async function update (value: string) {
  emit('update', value)
}

defineExpose({
  update,
  obscured,
})
</script>
