<template>
  <split-pane
    :docked="explorer_position"
    :docked_width="explorer_width"
    :resize_width="explorer_resize_width"
    @resize="update_explorer_width"
  >
    <template #docked>
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

    <template #dynamic>
      <div
        v-if="active"
        class="pane"
      >
        <file-edit
          v-if="active && selected && system.edit"
          :file="selected"
        />
        <file-view
          v-if="active && selected && !system.edit"
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
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_system_store } from '@/store/modules/system'
import File from '@/objects/File'

const configuration = fetch_configuration_store()
const files = fetch_files_store()
const repository = fetch_repository_store()
const system = fetch_system_store()

const selected = ref(File.Empty)

const active = computed(() => {
  return repository.path && files.active
})

const explore = computed(() => {
  return !(system.commit || system.push)
})

const explorer_position = computed(() => {
  return configuration.active.explorer_position
})

const explorer_width = computed(() => {
  return repository.path ? configuration.active.explorer_width : 0
})

const explorer_resize_width = computed(() => {
  return repository.path ? configuration.active.explorer_resize_width : 0
})

async function update_explorer_width (value) {
  await configuration.update(configuration.target, { explorer_width: value })
}

watch(active, (value) => {
  value === ''
    ? selected.value = File.Empty
    : selected.value = files.directory[value]
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
