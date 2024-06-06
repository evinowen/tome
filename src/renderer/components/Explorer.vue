<template>
  <context
    :load="async () => ExplorerContextMenu(file)"
    :target="file.path"
    class="explorer-root"
  >
    <explorer-node
      ref="root-node"
      root
      :uuid="file.uuid"
      :active="active"
      :enabled="enabled"
    />
  </context>
</template>

<script lang="ts">
import Context from './Context.vue'
import ExplorerNode from './ExplorerNode.vue'

export default {
  components: {
    Context,
    ExplorerNode,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_files_store } from '@/store/modules/files'
import File from '@/objects/File'
import ExplorerContextMenu from '@/objects/context/menus/ExplorerContextMenu'

export interface Properties {
  enabled: boolean
}

withDefaults(defineProps<Properties>(), {
  enabled: false,
})

const files = fetch_files_store()

const active = computed(() => {
  if (files.active === '') {
    return ''
  }

  const selected = files.directory[files.active]

  if (selected) {
    return selected.uuid
  }

  return ''
})

const file = computed((): File => {
  return files.directory[files.base] || File.Empty
})

defineExpose({
  active,
  file,
})
</script>

<style scoped>
.explorer-root {
  height: 100%;
  user-select: none;
}
</style>
