<template>
  <split-pane>
    <template #left>
      <div
        class="fit"
        style="overflow-y: overlay;"
      >
        <explorer
          ref="explorer"
          :enabled="explore"
        />
      </div>
    </template>

    <template #right>
      <div
        v-show="active"
        class="fit"
      >
        <file-view :enabled="view_render" />
        <file-editor :enabled="view_edit" />
        <div
          v-show="view_empty"
          class="fill-height"
        >
          <template v-if="selected !== undefined">
            <image-preview
              v-if="selected.image"
              :src="selected.path"
            />
            <file-summary v-else />
          </template>
        </div>
      </div>
    </template>
  </split-pane>
</template>

<script lang="ts">
import { Vue, Component, Watch, Setup, toNative } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import Explorer from '@/components/Explorer.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import FileEditor from './EditorInterface/FileEditor.vue'
import FileView from './EditorInterface/FileView.vue'
import FileSummary from './EditorInterface/FileSummary.vue'
import SplitPane from './EditorInterface/SplitPane.vue'
import File from '@/store/modules/files/file'

@Component({
  components: {
    Explorer,
    FileEditor,
    FileView,
    FileSummary,
    SplitPane,
    ImagePreview
  }
})
class EditorInterface extends Vue {
  static VIEW_EMPTY  = 'empty'
  static VIEW_EDIT   = 'edit'
  static VIEW_RENDER = 'render'

  @Setup(() => fetchStore())
  store!: Store<State>

  selected = File.Empty

  get active () {
    return this.store.state.files.active
  }

  get system () {
    return this.store.state.system
  }

  get explore () {
    return !(this.system.commit || this.system.push)
  }

  @Watch('active')
  select () {
    if (this.active === '') {
      this.selected = undefined
    }

    this.selected = this.store.state.files.directory[this.active]
  }

  get rendered () {
    if (this.selected === undefined) {
      return false
    }

    return ['.md', '.htm', '.html'].includes(this.selected.extension)
  }

  get view () {
    if (this.selected === undefined) {
      return EditorInterface.VIEW_EMPTY
    }

    if (!(this.selected.image || this.selected.directory)) {
      if (this.system.edit) {
        return EditorInterface.VIEW_EDIT
      }

      if (this.rendered) {
        return EditorInterface.VIEW_RENDER
      }
    }

    return EditorInterface.VIEW_EMPTY
  }

  get view_empty() {
    return this.view === EditorInterface.VIEW_EMPTY
  }

  get view_edit() {
    return this.view === EditorInterface.VIEW_EDIT
  }

  get view_render() {
    return this.view === EditorInterface.VIEW_RENDER
  }
}

export default toNative(EditorInterface)
</script>

<style>
.fit {
  width: 100%;
  height: 100%;
}

.full_size {
  height: 100%;
  padding: 0px;
}
</style>
