<template>
  <empty-pane>
    <file-button-icon
      :file="file"
      size="large"
      disabled
    />
    <v-divider
      v-if="file.name"
      class="mt-4"
    />
    <div style="font-size: 2em;">
      {{ file.name }}
    </div>
    <div style="font-size: 1.3em; opacity: 0.6">
      {{ file.relative }}
    </div>
  </empty-pane>
</template>

<script lang="ts">
import EmptyPane from '@/components/EmptyPane.vue'
import FileButtonIcon from '@/components/FileButtonIcon.vue'
import {
  VDivider,
} from 'vuetify/components'

export default {
  components: {
    EmptyPane,
    FileButtonIcon,
    VDivider,
  },
}
</script>

<script setup lang="ts">
import { File } from '@/store'

export interface Properties {
  file?: File
}

withDefaults(defineProps<Properties>(), {
  file: undefined,
})
</script>
