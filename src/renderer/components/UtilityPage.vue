<template>
  <div>
    <div
      :style="{ 'z-index': 100 + layer }"
      :class="[
        'pb-0',
        'page',
        location,
        open ? 'open' : undefined,
        scroll ? 'scroll' : undefined,
      ]"
    >
      <div class="title-box ma-2">
        <div class="title">
          <div class="text-h6 text-sm-h5 text-md-h4">
            <span class="title">{{ title }}</span>
          </div>
          <div class="text-subtitle-1">
            <span class="title">{{ subtitle }}</span>
          </div>
        </div>
        <v-btn
          ref="close-button"
          variant="flat"
          class="close-button"
          @click.stop="$emit('close')"
        >
          <v-icon>mdi-window-close</v-icon>
        </v-btn>
      </div>
      <div :class="['mx-2', 'content', fixed ? 'fixed' : undefined ]">
        <div
          class="d-flex flex-column"
          style="min-height: 100%"
        >
          <div class="flex-grow-1 flex-shrink-0 d-flex flex-column">
            <slot />
          </div>
          <div class="flex-grow-0 flex-shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
      <div class="mt-2 actions">
        <v-divider class="ma-0" />
        <div class="pa-2">
          <slot name="actions">
            <v-btn
              ref="close-action-button"
              size="small"
              color="primary"
              @click.stop="$emit('close')"
            >
              Done
            </v-btn>
          </slot>
        </div>
      </div>
    </div>
    <div>
      <slot name="overlays" />
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
  color: rgb(var(--v-theme-on-surface));
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
