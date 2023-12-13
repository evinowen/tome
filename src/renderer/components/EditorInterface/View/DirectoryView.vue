<template>
  <empty-pane>
    <file-icon
      :path="file.path"
      :directory="file.directory"
      :extension="file.extension"
      :image="file.image"
      :relationship="''.concat(file.relationship)"
      :expanded="file.expanded"
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
import FileIcon from '@/components/FileIcon.vue'
import {
  VDivider,
} from 'vuetify/components'

export default {
  components: {
    EmptyPane,
    FileIcon,
    VDivider,
  }
}
</script>

<script setup lang="ts">
import { File } from '@/store'

export interface Props {
  file?: File,
}

withDefaults(defineProps<Props>(), {
  file: undefined,
})
</script>
