<template>
  <v-layout class="key-border pt-1">
    <v-col class="pa-1">
      <v-text-field
        :model-value="value || ' '"
        :label="label"
        class="key-output"
        readonly
        variant="outlined"
        hide-details
      />
    </v-col>
    <v-btn
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="copy"
    >
      <v-icon size="small">
        mdi-content-copy
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
import { fetchStore } from '@/store'

const store = fetchStore()

export interface Props {
  label?: string,
  small?: boolean,
  value: string,
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  small: false,
  value: '',
})

async function copy () {
  await store.dispatch('clipboard/text', props.value)
}

defineExpose({
  copy,
})
</script>

<style scoped>
.key-output {
  font-family: monospace !important;
}
</style>
