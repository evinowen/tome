<template>
  <div
    :style="{ 'z-index': 100 + layer }"
    :class="[
      'page',
      open ? 'open' : undefined
    ]"
  >
    <v-btn
      ref="close-button"
      rounded="0"
      class="pa-0"
      style="height: 16px; width: 100%"
      color="accent"
      @click.stop="$emit('close')"
    >
      <v-icon size="small">
        mdi-chevron-down
      </v-icon>
    </v-btn>
    <div
      ref="container"
      class="content"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
  },
  emits: [
    'close',
  ],
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface Properties {
  open: boolean
  layer?: number
}

const properties = withDefaults(defineProps<Properties>(), {
  open: false,
  layer: 0,
})

const container = ref<HTMLElement>()

watch(() => properties.open, (value) => {
  if (value) {
    container.value.scrollTop = container.value.scrollHeight
  }
})
</script>

<style scoped>
.page {
  background: rgb(var(--v-theme-surface));
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
  position: absolute;
  transition: transform 400ms ease;
  width: 100%;
  transform: translateY(100%);
}

.page.open {
  transform: translateY(0%);
}

.content {
  overflow-y: scroll;
  flex-grow: 1;
}
</style>
