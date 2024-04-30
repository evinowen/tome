<template>
  <toggle-switch
    ref="switch"
    :value="value"
    :height="16"
    :width="32"
    :padding="2"
    class="mx-1"
    @input="emit('input', $event)"
  />
</template>

<script lang="ts">
import ToggleSwitch from '@/components/ToggleSwitch.vue'

export default {
  components: {
    ToggleSwitch,
  },
}
</script>

<script setup lang="ts">
export interface Properties {
  value?: boolean
}

withDefaults(defineProps<Properties>(), {
  value: false,
})

const emit = defineEmits([
  'input',
])
</script>
