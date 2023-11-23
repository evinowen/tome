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
        <file-edit
          v-if="system.edit"
          :file="selected"
        />
        <file-view
          v-else
          :file="selected"
        />
      </div>
    </template>
  </split-pane>
</template>

<script lang="ts">
import { Vue, Component, Watch, Setup, toNative } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import File from '@/store/modules/files/file'
import Explorer from '@/components/Explorer.vue'
import FileEdit from './EditorInterface/FileEdit.vue'
import FileView from './EditorInterface/FileView.vue'
import SplitPane from './EditorInterface/SplitPane.vue'

@Component({
  components: {
    Explorer,
    FileEdit,
    FileView,
    SplitPane,
  }
})
class EditorInterface extends Vue {
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
