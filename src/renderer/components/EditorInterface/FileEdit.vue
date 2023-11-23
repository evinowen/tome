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
import { Component, Vue, toNative, Prop } from 'vue-facing-decorator'
import { File } from '@/store'
import TextEdit from './Edit/TextEdit.vue'
import DirectoryView from './View/DirectoryView.vue'
import ImageView from './View/ImageView.vue'

@Component({
  components: {
    DirectoryView,
    TextEdit,
    ImageView,
  }
})
class FileEdit extends Vue {
  @Prop({ type: File, default: undefined })
  file?: File
}

export default toNative(FileEdit)
</script>
