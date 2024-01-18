<template>
  <v-layout class="key-border pt-1">
    <v-col class="pa-1">
      <input
        ref="input"
        type="file"
        style="display: none"
        @change="select"
      >
      <v-text-field
        :model-value="value || ' '"
        :label="label"
        :class="[ value ? 'v-text-field-green' : 'v-text-field-red' ]"
        :color="value ? 'green' : 'red'"
        :prepend-inner-icon="value ? 'mdi-lock-open' : 'mdi-lock'"
        readonly
        variant="outlined"
        hide-details
        density="compact"
        @click.stop="input.click()"
      />
    </v-col>
    <v-btn
      ref="clear"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="clear"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      ref="recall"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="stored === ''"
      @click.stop="recall"
    >
      <v-icon size="small">
        mdi-cog
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
import {
  VBtn,
  VCol,
  VIcon,
  VLayout,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VCol,
    VIcon,
    VLayout,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

export interface Properties {
  label?: string
  stored?: string
  value?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  forge: false,
  label: '',
  stored: '',
  value: '',
})

const emit = defineEmits([ 'input', 'forge' ])

const input = ref<HTMLInputElement>(undefined)

function select (event) {
  const files = event.target.files || event.dataTransfer.files
  const file = files.length > 0 ? files[0] : undefined

  if (!file.path) {
    return
  }

  update(file.path)
  input.value.value = ''
}

function clear () {
  update('')
}

function recall () {
  update(properties.stored)
}

function update (path) {
  emit('input', path)
}

defineExpose({
  update,
})
</script>

<style scoped>
.key-label {
  font-size: 0.8em;
}

.key-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
}

.v-text-field-red :deep() fieldset {
  color: red;
  border-color: red;
}

.v-text-field-green :deep() fieldset {
  color: green;
  border-color: green;
}
</style>
