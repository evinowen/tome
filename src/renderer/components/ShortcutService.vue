<template><div /></template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { fetchStore } from '@/store'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'
import { shortcuts } from '@/shortcuts'

const store = fetchStore()
const ShortcutOperator = operate_shortcuts(store)

onMounted(() => window.addEventListener('keyup', keyup))
onUnmounted(() => window.removeEventListener('keyup', keyup))

async function keyup (event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      await ShortcutOperator.escape()
      return
  }

  if (!event.ctrlKey) {
    return
  }

  const shortcut = shortcuts(event.key)
  if (!shortcut) {
    return
  }

  if (shortcut.layer) {
    await ShortcutOperator.layer(shortcut.layer)
  }

  if (shortcut.perform) {
    await ShortcutOperator.perform(shortcut.perform)
  }

  if (shortcut.dispatch) {
    await ShortcutOperator.dispatch(shortcut.dispatch)
  }
}

defineExpose({
  keyup,
})
</script>
