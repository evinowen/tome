<template>
  <context-menu-node
    v-if="context.visible"
    ref="root-node"
    v-resize="resize"
    :window_x="window_x"
    :window_y="window_y"
    :position_x="context.position.x"
    :position_y="context.position.y"
    :items="context.menu?.items"
    :layer="10000"
    root
    @close="close"
  />
</template>

<script lang="ts">
import ContextMenuNode from './ContextMenuNode.vue'
import {
  Resize,
} from 'vuetify/directives'

export default {
  components: {
    ContextMenuNode,
  },
  directives: {
    Resize,
  },
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { fetch_context_store } from '@/store/modules/context'

const context = fetch_context_store()

const window_x = ref(0)
const window_y = ref(0)

function resize () {
  window_x.value = window.innerWidth
  window_y.value = window.innerHeight
}

async function close () {
  await context.close()
}

defineExpose({
  close,
  resize,
})
</script>
