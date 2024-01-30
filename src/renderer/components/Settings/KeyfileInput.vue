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
        @click="input.click()"
      />
    </v-col>
    <v-btn
      ref="clear-button"
      rounded="0"
      icon
      style="height: auto;"
      :disabled="value === ''"
      @click="clear"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      ref="generate-button"
      rounded="0"
      icon
      style="height: auto;"
      :disabled="value !== ''"
      @click.stop="generate"
    >
      <v-icon size="small">
        mdi-anvil
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
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

export interface Properties {
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  index: '',
})

defineEmits([ 'input', 'forge' ])

const input = ref<HTMLInputElement>(undefined)
const value = computed<string>(() => store.state.configuration[properties.index])
const passphrase = computed<string>(() => store.state.configuration.passphrase)

async function select (event) {
  const files = event.target.files || event.dataTransfer.files
  const file = files.length > 0 ? files[0] : undefined

  if (!file.path) {
    return
  }

  await update(file.path)
  input.value.value = ''
}

async function clear () {
  await update('')
}

async function update (path) {
  await store.dispatch('configuration/update', { [properties.index]: path })
}

async function generate () {
  await store.dispatch('configuration/generate', passphrase.value)
}

defineExpose({
  update,
  value,
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
