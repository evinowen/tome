<template>
  <div>
    <v-divider />
    <v-textarea
      ref="input-field"
      class="monospace"
      persistent-placeholder
      :model-value="value"
      required
      clearable
      auto-grow
      no-resize
      hide-details
      :rounded="0"
      :error="value.length > max_length"
      @update:model-value="debounce_update"
    />
    <div class="mx-2 pt-1 pb-2 d-flex monospace">
      <div style="flex-grow: 1; white-space: nowrap;">
        {{ value.length }} / {{ max_length }}
      </div>
      <div style="flex-grow: 1; text-align: right;">
        <template v-if="signature_name">
          <span>{{ signature_name }}</span>
        </template>
        <template v-else>
          <span style="color: red; white-space: nowrap;">
            Signature Name is Blank
          </span>
        </template>
        &nbsp;
        <template v-if="signature_email">
          <span>&lt;{{ signature_email }}&gt;</span>
        </template>
        <template v-else>
          <span style="color: red; white-space: nowrap;">
            &lt;Signature E-Mail is Blank&gt;
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash'
import { VDivider, VTextarea } from 'vuetify/components'

interface Properties {
  max_length?: number
  signature_name?: string
  signature_email?: string
  value: string
}

withDefaults(defineProps<Properties>(), {
  max_length: 72,
  signature_name: '',
  signature_email: '',
  value: '',
})

const emit = defineEmits([ 'update' ])

async function update (value: string) {
  emit('update', value)
}

const debounce_update = debounce(update, 500)

defineExpose({
  update,
})
</script>

<style scoped>
.readonly :deep(*) {
  cursor: default !important;
}

.monospace {
  font-family: var(--font-monospace), Monospace;
  font-size: var(--font-monospace-size)
}
</style>
