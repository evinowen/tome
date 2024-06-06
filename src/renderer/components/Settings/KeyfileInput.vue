<template>
  <div class="d-flex key-border">
    <div class="flex-grow-1 pa-1">
      <input
        ref="input"
        type="file"
        style="display: none"
        @change="select"
      >
      <v-text-field
        :model-value="model || ' '"
        :disabled="disabled"
        :label="label"
        :class="[ model ? 'v-text-field-green' : 'v-text-field-red' ]"
        :color="model ? 'green' : 'red'"
        :prepend-inner-icon="model ? 'mdi-lock-open' : 'mdi-lock'"
        readonly
        variant="solo"
        hide-details
        density="compact"
        @click="input.click()"
      />
    </div>
    <div class="flex-grow-0 pa-1">
      <v-btn
        ref="clear-button"
        rounded="0"
        icon
        style="height: 100%;"
        :disabled="disabled || model === ''"
        @click="clear"
      >
        <v-icon size="small">
          mdi-close
        </v-icon>
      </v-btn>
    </div>
    <div class="flex-grow-0 pa-1">
      <v-btn
        ref="generate-button"
        rounded="0"
        icon
        style="height: 100%;"
        :disabled="disabled || model !== ''"
        @click.stop="generate"
      >
        <v-icon size="small">
          mdi-anvil
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VBtn,
  VIcon,
  VTextField,
} from 'vuetify/components'

import { computed, ref } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'

const properties = withDefaults(defineProps<SettingProperties>(), SettingPropertiesDefaults())

defineEmits([ 'input', 'forge' ])

const configuration = fetch_configuration_store()

const input = ref<HTMLInputElement>()
const passphrase = computed<string>(() => configuration[configuration.target].credentials.passphrase)
const { disabled, update, model } = SettingSetup<string>(properties, 0)

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

async function generate () {
  await configuration.generate(configuration.target, passphrase.value)
}

defineExpose({
  update,
  model,
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
