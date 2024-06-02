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
    v-else-if="file.text"
    :file="file"
  />
  <simple-view
    v-else
    :file="file"
  />
</template>

<script lang="ts">
import DirectoryView from './View/DirectoryView.vue'
import ImageView from './View/ImageView.vue'
import TextEdit from './Edit/TextEdit.vue'
import SimpleView from './View/SimpleView.vue'

export default {
  components: {
    DirectoryView,
    ImageView,
    TextEdit,
    SimpleView,
  },
}
</script>

<script setup lang="ts">
import File from '@/objects/File'

export interface Properties {
  file?: File
}

withDefaults(defineProps<Properties>(), {
  file: undefined,
})
</script>
