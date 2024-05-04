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
import { ContextMenu } from '@/store/modules/context'

export interface Properties {
  dynamic?: boolean
  load: (store: Store<State>) => ContextMenu
  target?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  dynamic: false,
  target: '',
})

const store = fetchStore()
const element = ref<HTMLElement>()

async function context_commands () {
  const menu = properties.load(store)

  await store.dispatch('context/set', { target: properties.target, menu })
}

async function context_menu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY,
  }

  if (properties.dynamic) {
    const menu = properties.load(store)
    await store.dispatch('context/set', { target: properties.target, menu })
  }

  await store.dispatch('context/open', { position })
}

defineExpose({
  element,
})
</script>
