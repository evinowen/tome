<template>
  <context
    :load="async (store) => ExplorerContextMenu(store, file)"
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
import { fetchStore } from '@/store'
import File from '@/store/modules/files/file'
import ExplorerContextMenu from '@/objects/context/menus/ExplorerContextMenu'

export interface Properties {
  enabled: boolean
}

withDefaults(defineProps<Properties>(), {
  enabled: false,
})

const store = fetchStore()

const active = computed(() => {
  if (store.state.files.active === '') {
    return ''
  }

  const selected = store.state.files.directory[store.state.files.active]

  if (selected) {
    return selected.uuid
  }

  return ''
})

const file = computed((): File => {
  return store.state.files.directory[store.state.files.base] || File.Empty
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
