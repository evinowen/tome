<template>
  <div
    ref="element"
    tabindex="0"
    @click.right.stop="context_menu"
    @focus="context_commands"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Store } from 'vuex'
import { fetchStore, State } from '@/store'
import ContextMenu from '@/objects/context/ContextMenu'

export interface Properties {
  load: (store: Store<State>) => Promise<ContextMenu>
}

const properties = defineProps<Properties>()

const store = fetchStore()
const element = ref<HTMLElement>()

async function context_commands () {
  await store.dispatch('context/set', async () => await properties.load(store))
}

async function context_menu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY,
  }

  await store.dispatch('context/open', { position })
}

defineExpose({
  context_commands,
  context_menu,
  element,
})
</script>
