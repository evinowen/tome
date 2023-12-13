<template>
  <context-menu-node
    v-if="context.visible"
    ref="root"
    v-resize="resize"
    :window_x="window_x"
    :window_y="window_y"
    :position_x="context.position.x"
    :position_y="context.position.y"
    :title="context.title"
    :target="context.target"
    :items="context.items"
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
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const window_x = ref(0)
const window_y = ref(0)
const visible = ref(true)

const context = computed(() => store.state.context)

function resize () {
  window_x.value = window.innerWidth
  window_y.value = window.innerHeight
}

async function close () {
  await store.dispatch('context/close')
}
</script>
