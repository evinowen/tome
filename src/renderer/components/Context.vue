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
import { fetch_context_store } from '@/store/modules/context'
import ContextMenu from '@/objects/context/ContextMenu'

export interface Properties {
  load: () => Promise<ContextMenu>
}

const properties = defineProps<Properties>()

const context = fetch_context_store()
const element = ref<HTMLElement>()

async function context_commands () {
  await context.set(properties.load)
}

async function context_menu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY,
  }

  await context.open({ position })
}

defineExpose({
  context_commands,
  context_menu,
  element,
})
</script>
