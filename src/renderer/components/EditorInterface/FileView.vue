<template>
  <directory-view
    v-if="file.directory"
    :file="file"
  />
  <image-view
    v-else-if="file.image"
    :file="file"
  />
  <text-view
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
import TextView from './View/TextView.vue'
import SimpleView from './View/SimpleView.vue'

export default {
  components: {
    DirectoryView,
    ImageView,
    TextView,
    SimpleView,
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
