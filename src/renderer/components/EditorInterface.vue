<template>
  <split-pane>
    <template #left>
      <div
        class="pane"
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
        class="pane"
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
import Explorer from '@/components/Explorer.vue'
import FileEdit from './EditorInterface/FileEdit.vue'
import FileView from './EditorInterface/FileView.vue'
import SplitPane from './EditorInterface/SplitPane.vue'

export default {
  components: {
    Explorer,
    FileEdit,
    FileView,
    SplitPane,
  },
}
</script>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { fetchStore } from '@/store'
import File from '@/store/modules/files/file'

const store = fetchStore()

const selected = ref(File.Empty)

const active = computed(() => {
  return store.state.files.active
})

const system = computed(() => {
  return store.state.system
})

const explore = computed(() => {
  return !(store.state.system.commit || store.state.system.push)
})

watch(active, (value) => {
  value === ''
    ? selected.value = File.Empty
    : selected.value = store.state.files.directory[value]
})

defineExpose({
  active,
  selected,
})
</script>

<style scoped>
.pane {
  width: 100%;
  height: 100%;
}
</style>
