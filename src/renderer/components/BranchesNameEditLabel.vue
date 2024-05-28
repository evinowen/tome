<template>
  <input
    v-show="visible"
    ref="input"
    v-model="model"
    @blur="emit('update', model)"
    @keydown.enter="emit('update', model)"
  >
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

export interface Properties {
  value: string
  visible?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  value: '',
  visible: false,
})

const emit = defineEmits([
  'update',
])

const model = ref('')
const input = ref<HTMLInputElement>()

watch(() => properties.visible, async () => {
  if (!input.value) {
    return
  }

  model.value = properties.value

  if (properties.visible) {
    await nextTick()
    input.value.focus()
    input.value.select()
  }
})

defineExpose({
  model,
})
</script>

<style scoped>

</style>
