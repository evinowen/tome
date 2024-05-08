<template>
  <v-btn
    ref="button"
    rounded="0"
    variant="text"
    :class="[
      'button-icon-button',
      { [`button-icon-${size}`]: size },
      { 'button-icon-disabled': disabled },
    ]"
    @click.stop="$emit('click', $event)"
  >
    <v-icon
      :class="[
        'button-icon-icon',
        { 'button-icon-expanded': expanded },
        { 'button-icon-icon-badged': badge || alert },
      ]"
    >
      {{ icon }}
    </v-icon>
    <v-icon
      v-if="badge || alert"
      :class="[
        'button-icon-badge',
        { 'button-icon-expanded': expanded },
        { [`button-icon-${modifier}`]: modifier },
      ]"
      :color="alert ? 'red' : ''"
    >
      {{ badge || (alert ? 'mdi-alert-circle' : '' ) }}
    </v-icon>
  </v-btn>
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
    'click',
  ],
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

export interface Properties {
  alert?: boolean
  badge?: string
  disabled?: boolean
  expanded?: boolean
  icon?: string
  size?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  alert: false,
  badge: '',
  disabled: false,
  expanded: false,
  icon: '',
  size: 'small',
})

const modifier = computed(() => {
  switch (properties.badge) {
    case 'mdi-cog':
      return 'modify-cog'

    case 'mdi-eye-circle':
      return 'modify-eye'

    case 'mdi-language-javascript':
      return 'modify-js'

    case 'mdi-lock':
      return 'modify-lock'

    case 'mdi-code-json':
      return 'modify-json'
  }

  return ''
})

defineExpose({
  modifier,
})
</script>

<style scoped>
.button-icon-disabled,
.button-icon-disabled :deep(*) {
  pointer-events: none !important;
}

* {
  --tome-button-icon-small: 1;
  --tome-button-icon-large: 8;
}

.button-icon-small {
  --tome-button-icon-factor: var(--tome-button-icon-small);
}

.button-icon-large {
  --tome-button-icon-factor: var(--tome-button-icon-large);
}

.button-icon-button {
  --tome-button-icon-button: calc(var(--tome-button-icon-factor) * 20px);

  width: var(--tome-button-icon-button) !important;
  min-width: var(--tome-button-icon-button) !important;
  height: var(--tome-button-icon-button) !important;
  min-height: var(--tome-button-icon-button) !important;
  padding: 0 !important;
}

.button-icon-icon {
  --tome-button-icon-icon: calc(var(--tome-button-icon-factor) * 14px);

  font-size: var(--tome-button-icon-icon) !important;
}

.button-icon-icon-badged {
  --tome-button-icon-icon-badged-circle-x: calc(100% - (var(--tome-button-icon-factor) * 0.5 * 10px));
  --tome-button-icon-icon-badged-circle-y: calc(100% - (var(--tome-button-icon-factor) * 0.5 * 7px));
  --tome-button-icon-icon-badged-gradient: calc(var(--tome-button-icon-factor) * 0.5 * 9px);
  --tome-button-icon-icon-badged-gradient-edge: calc((var(--tome-button-icon-factor) * 0.5 * 9px) + 1px);

  -webkit-mask-image:
    radial-gradient(
      circle at var(--tome-button-icon-icon-badged-circle-x) var(--tome-button-icon-icon-badged-circle-y),
      rgba(0, 0, 0, 0) var(--tome-button-icon-icon-badged-gradient),
      rgba(0, 0, 0, 1) var(--tome-button-icon-icon-badged-gradient-edge)
    );
  mask-image:
    radial-gradient(
      circle at var(--tome-button-icon-icon-badged-circle-x) var(--tome-button-icon-icon-badged-circle-y),
      rgba(0, 0, 0, 0) var(--tome-button-icon-icon-badged-gradient),
      rgba(0, 0, 0, 1) var(--tome-button-icon-icon-badged-gradient-edge)
    );
}

.button-icon-icon-badged.button-icon-expanded {
  --tome-button-icon-icon-badged-circle-y: calc(100% - (var(--tome-button-icon-factor) * 0.5 * 5px));
}

.button-icon-badge {
  --tome-button-icon-badge: calc(var(--tome-button-icon-factor) * 10px);
  --tome-button-icon-badge-font: calc(var(--tome-button-icon-factor) * 9px);
  --tome-button-icon-badge-gradient: calc(var(--tome-button-icon-factor) * 0.5 * 7px);
  --tome-button-icon-badge-gradient-edge: calc((var(--tome-button-icon-factor) * 0.5 * 7px) + 1px);
  --tome-button-icon-badge-bottom: calc(var(--tome-button-icon-factor) * 0.5 * 3px);
  --tome-button-icon-badge-right: calc(var(--tome-button-icon-factor) * 0.5 * 6px);

  position: absolute;
  width: var(--tome-button-icon-badge) !important;
  min-width: var(--tome-button-icon-badge) !important;
  height: var(--tome-button-icon-badge) !important;
  min-height: var(--tome-button-icon-badge) !important;

  -webkit-mask-image:
    radial-gradient(
      rgba(0, 0, 0, 1) var(--tome-button-icon-badge-gradient),
      rgba(0, 0, 0, 0) var(--tome-button-icon-badge-gradient-edge)
    );
  mask-image:
    radial-gradient(
      rgba(0, 0, 0, 1) var(--tome-button-icon-badge-gradient),
      rgba(0, 0, 0, 0) var(--tome-button-icon-badge-gradient-edge)
    );
  font-size: var(--tome-button-icon-badge-font) !important;
  bottom: var(--tome-button-icon-badge-bottom);
  right: var(--tome-button-icon-badge-right);
}

.button-icon-badge.button-icon-expanded {
  --tome-button-icon-badge-bottom: calc(var(--tome-button-icon-factor) * 0.5px);
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.button-icon-large .button-icon-modify-cog {
  animation: rotating 2s linear infinite;
}

.button-icon-modify-book {
  --tome-button-icon-badge-font: calc(var(--tome-button-icon-factor) * 12px) !important;
}

.button-icon-modify-eye {
  --tome-button-icon-badge-font: calc(var(--tome-button-icon-factor) * 10px) !important;
}

.button-icon-modify-js {
  --tome-button-icon-badge-font: calc(var(--tome-button-icon-factor) * 11.25px) !important;
}

.button-icon-modify-lock,
.button-icon-modify-json {
  --tome-button-icon-badge-font: calc(var(--tome-button-icon-factor) * 7.5px) !important;
}

.button-icon-button:active .button-icon-modify-lock,
.button-icon-modify-lock:active {
  color: darkorange !important;
}
</style>
