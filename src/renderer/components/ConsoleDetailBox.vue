<template>
  <overlay-box
    :visible="visible"
    :secure="false"
    @click="emit('done')"
  >
    <v-card class="ma-2">
      <v-card-item class="mt-2">
        <template #prepend>
          <v-avatar
            size="x-small"
            :color="color"
          >
            <v-icon>
              {{ icon }}
            </v-icon>
          </v-avatar>
        </template>
        <v-card-title>
          {{ message }}
        </v-card-title>
      </v-card-item>
      <v-card-text>
        {{ message }}
        <div v-if="stack">
          {{ stack }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          ref="done-button"
          @click="emit('done')"
        >
          Done
        </v-btn>
      </v-card-actions>
    </v-card>
  </overlay-box>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OverlayBox from '@/components/OverlayBox.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VCardItem,
  VCardText,
  VCardTitle,
  VIcon,
} from 'vuetify/components'

export interface Properties {
  visible?: boolean
  level: string
  message: string
  stack?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  visible: false,
  level: '',
  message: '',
  stack: '',
})

const emit = defineEmits([
  'done',
])

const color = computed(() => {
  switch (properties.level) {
    case 'trace':
      return 'background'

    case 'debug':
      return 'success'

    case 'info':
      return 'info'

    case 'warn':
      return 'warning'

    case 'error':
    case 'fatal':
      return 'error'

    default:
      return ''
  }
})

const icon = computed(() => {
  switch (properties.level) {
    case 'trace':
      return 'mdi-dots-horizontal'

    case 'debug':
      return 'mdi-eye'

    case 'info':
      return 'mdi-information-slab-symbol'

    case 'warn':
      return 'mdi-bell'

    case 'error':
    case 'fatal':
      return 'mdi-close-thick'

    default:
      return ''
  }
})

defineExpose({
  color,
  icon,
})
</script>

<style scoped>
.overlay {
  background: rgba(var(--v-theme-on-background), 0.25);
  justify-content: center;
  align-items: center;
  display: flex;
  height: calc(100vh - 25px);
  left: 0;
  position: fixed;
  top: 25px;
  width: 100vw;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease-in-out;
  z-index: 100000;
}

.overlay.visible {
  opacity: 1;
  pointer-events: all;
}
</style>
