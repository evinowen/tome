<template>
  <empty-pane id="root">
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
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VDivider } from 'vuetify/components'
import { File } from '@/store'
import EmptyPane from '@/components/EmptyPane.vue'
import FileIcon from '@/components/FileIcon.vue'

@Component({
  components: {
    EmptyPane,
    FileIcon,
    VDivider
  }
})
class DirectoryView extends Vue {
  @Prop({ type: File, default: undefined })
  file?: File
}

export default toNative(DirectoryView)
</script>

<style>
#root {
  height: 100%;
  width: 100%;
}
</style>
