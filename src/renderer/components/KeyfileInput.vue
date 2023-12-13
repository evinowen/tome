<template>
  <v-layout class="key-border pt-1">
    <v-col class="pa-1">
      <input
        ref="input"
        type="file"
        style="display: none"
        @change="update"
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
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      v-if="forge"
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value !== ''"
      @click.stop="$emit('forge')"
    >
      <v-icon size="small">
        mdi-anvil
      </v-icon>
    </v-btn>
    <v-btn
      v-if="storable"
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="stored === ''"
      @click.stop="$emit('input', stored)"
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
  }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

export interface Props {
  forge?: boolean,
  label?: string,
  small?: boolean,
  storable?: boolean,
  stored?: string,
  value: string,
}

withDefaults(defineProps<Props>(), {
  forge: false,
  label: '',
  small: false,
  storable: false,
  stored: '',
  value: '',
})

const emit = defineEmits(['input', 'forge'])

const input = ref<HTMLInputElement>(null)

async function update (event) {
  const files = event.target.files || event.dataTransfer.files
  const file = files.length > 0 ? files[0] : undefined

  if (!file.path) {
    return
  }

  emit('input', file.path)
  input.value.value = ''
}
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
