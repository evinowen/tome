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
        :model-value="value || ' '"
        :label="label"
        :class="[ value ? 'v-text-field-green' : 'v-text-field-red' ]"
        :color="value ? 'green' : 'red'"
        :prepend-inner-icon="value ? 'mdi-lock-open' : 'mdi-lock'"
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
        :disabled="value === ''"
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
        :disabled="value !== ''"
        @click.stop="generate"
      >
        <v-icon size="small">
          mdi-anvil
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { debounce } from 'lodash'

const configuration = fetch_configuration_store()

interface Properties {
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  index: '',
})

defineEmits([ 'input', 'forge' ])

const input = ref<HTMLInputElement>(undefined)
const value = computed<string>(() => configuration[properties.index])
const passphrase = computed<string>(() => configuration.passphrase)

async function select (event) {
  const files = event.target.files || event.dataTransfer.files
  const file = files.length > 0 ? files[0] : undefined

  if (!file.path) {
    return
  }

  await debounce_update(file.path)
  input.value.value = ''
}

async function clear () {
  await debounce_update('')
}

async function update (path) {
  await configuration.update({ [properties.index]: path })
}

const debounce_update = debounce(update, 300)

async function generate () {
  await configuration.generate(passphrase.value)
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
