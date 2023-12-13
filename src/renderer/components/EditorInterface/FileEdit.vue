<template>
  <directory-view
    v-if="file.directory"
    :file="file"
  />
  <image-view
    v-else-if="file.image"
    :file="file"
  />
  <text-edit
    v-else
    :file="file"
  />
</template>

<script lang="ts">
import DirectoryView from './View/DirectoryView.vue'
import ImageView from './View/ImageView.vue'
import TextEdit from './Edit/TextEdit.vue'

export default {
  components: {
    DirectoryView,
    ImageView,
    TextEdit,
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
