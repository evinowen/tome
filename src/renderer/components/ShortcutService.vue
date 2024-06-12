<template><div /></template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { fetch_error_store } from '@/store/modules/error'
import { fetch_context_store } from '@/store/modules/context'
import { operate as operate_shortcuts } from '@/modules/Shortcuts'
import { shortcuts } from '@/shortcuts'

const error = fetch_error_store()
const context = fetch_context_store()

const ShortcutOperator = operate_shortcuts()

onMounted(() => window.addEventListener('keyup', keyup))
onUnmounted(() => window.removeEventListener('keyup', keyup))

async function keyup (event: KeyboardEvent) {
  if (error.visible) {
    return
  }

  await context.load()

  const key = event.key.toLowerCase()

  if (context.menu && context.menu.shortcuts.has(key)) {
    const items = context.menu.shortcuts.get(key)
    for (const item of items) {
      if (event.ctrlKey !== item.command.control) {
        continue
      }

      if (event.shiftKey !== item.command.shift) {
        continue
      }

      if (event.altKey !== item.command.alt) {
        continue
      }

      await item.execute()

      return
    }
  }

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
}

defineExpose({
  keyup,
})
</script>
