<template>
  <empty-pane id="root">
    <template v-if="active">
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
    </template>
  </empty-pane>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative, Watch } from 'vue-facing-decorator'
import { VDivider } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import File from '@/store/modules/files/file'
import EmptyPane from '@/components/EmptyPane.vue'
import FileIcon from '@/components/FileIcon.vue'

@Component({
  components: {
    EmptyPane,
    FileIcon,
    VDivider
  }
})
class FileSummary extends Vue {
  @Setup(() => fetchStore())
  store: Store<State>

  file = File.Empty

  get active (): boolean {
    return this.file !== File.Empty
  }

  get key (): string {
    return this.store.state.files.active
  }

  @Watch('key')
  select (): void {
    this.file = this.store.state.files.directory[this.key]
  }
}

export default toNative(FileSummary)
</script>

<style>
#root {
  height: 100%;
  width: 100%;
}
</style>
