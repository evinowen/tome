<template>
  <div class="d-flex key-border">
    <div class="flex-grow-1 pa-1">
      <v-text-field
        :model-value="value || ' '"
        :label="label"
        class="key-output"
        readonly
        density="compact"
        variant="solo"
        hide-details
      />
    </div>
    <div class="flex-grow-0 pa-1">
      <v-btn
        rounded="0"
        icon
        :size="small ? 'small' : undefined"
        style="height: 100%;"
        :disabled="value === ''"
        @click.stop="copy"
      >
        <v-icon size="small">
          mdi-content-copy
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
import { fetch_clipboard_store } from '@/store/modules/clipboard'

const clipboard = fetch_clipboard_store()

interface Properties {
  label?: string
  small?: boolean
  value: string
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  small: false,
  value: '',
})

async function copy () {
  await clipboard.text(properties.value)
}

defineExpose({
  copy,
})
</script>

<style scoped>
.key-output :deep(input) {
  font-family: var(--font-monospace), monospace !important;
}
</style>
