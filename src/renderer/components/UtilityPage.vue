<template>
  <div
    :style="{ 'z-index': 100 + layer }"
    :class="[
      'pa-2',
      'pb-0',
      'page',
      location,
      open ? 'open' : undefined,
      scroll ? 'scroll' : undefined,
    ]"
  >
    <div class="title-box mb-2">
      <div class="title">
        <h1>{{ title }}</h1>
        <div class="text-subtitle-1">
          {{ subtitle }}
        </div>
      </div>
      <v-btn
        ref="close"
        variant="flat"
        class="close-button"
        @click.stop="$emit('close')"
      >
        <v-icon>mdi-window-close</v-icon>
      </v-btn>
    </div>
    <div :class="['mb-2', 'content', fixed ? 'fixed' : undefined ]">
      <slot />
    </div>
    <div class="pb-2 actions">
      <v-divider class="mt-0 mb-2" />
      <slot name="actions">
        <v-btn
          ref="close_action"
          size="small"
          color="primary"
          @click.stop="$emit('close')"
        >
          Done
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VDivider,
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VDivider,
    VIcon,
  },
  emits: [
    'close',
  ],
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

export interface Properties {
  open: boolean
  title?: string
  subtitle?: string
  layer?: number
  scroll?: boolean
  fixed?: boolean
  left?: boolean
  right?: boolean
  bottom?: boolean
  top?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  open: false,
  title: '',
  subtitle: '',
  layer: 0,
  scroll: true,
  fixed: false,
  left: false,
  right: false,
  bottom: false,
  top: false,
})

const location = computed(() => {
  if (properties.left) {
    return 'left'
  }

  if (properties.right) {
    return 'right'
  }

  if (properties.bottom) {
    return 'bottom'
  }

  if (properties.top) {
    return 'top'
  }

  return 'top'
})

defineExpose({
  location,
})
</script>

<style scoped>
.page {
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
  position: absolute;
  transition: transform 400ms ease;
  width: 100%;
}

.page.scroll {
  overflow-y: scroll;
}

.page.left {
  transform: translateX(-100%);
}

.page.right {
  transform: translateX(100%);
}

.page.bottom {
  transform: translateY(100%);
  bottom: 0;
}

.page.top {
  transform: translateY(-100%);
}

.page.open {
  transform: translateY(0%);
}

.content {
  flex-shrink: 1;
  flex-grow: 1;
}

.content.fixed {
  height: 100%;
}

.title-box {
  display: flex;
}

.title {
  flex-grow: 1;
}

.close-button {
  float: right;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0;
  min-width: 0;
  height: 36px;
  width: 36px;
}

.actions {
  backdrop-filter: blur(2px);
  bottom: 0;
  flex-grow: 0;
  position: sticky;
}
</style>
