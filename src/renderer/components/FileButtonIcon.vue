<template>
  <button-icon
    :alert="alert"
    :badge="badge"
    :icon="icon"
    :size="size"
    :disabled="disabled"
    :expanded="file.expanded"
  />
</template>

<script lang="ts">
import ButtonIcon from './ButtonIcon.vue'

export default {
  components: {
    ButtonIcon,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import File, { FileRelationshipType } from '@/store/modules/files/file'

export interface Properties {
  alert?: boolean
  disabled?: boolean
  size?: string
  file: File
}

const properties = withDefaults(defineProps<Properties>(), {
  alert: false,
  disabled: false,
  size: 'small',
})

const system = computed(() => {
  return [
    FileRelationshipType.Git,
    FileRelationshipType.Tome,
    FileRelationshipType.TomeFeatureActions,
    FileRelationshipType.TomeFeatureTemplates,
    FileRelationshipType.TomeAction,
    FileRelationshipType.TomeTemplate,
  ].includes(properties.file.relationship)
})

const icon = computed(() => {
  if (properties.file.directory) {
    if (properties.file.relationship === 'root') {
      return properties.file.expanded ? 'mdi-book-open-page-variant' : 'mdi-book'
    }

    return properties.file.expanded ? 'mdi-folder-open' : 'mdi-folder'
  }

  if (properties.file.image) {
    return 'mdi-image'
  }

  if (properties.file.relationship === 'tome-file') {
    return 'mdi-file'
  }

  return 'mdi-newspaper-variant'
})

const badge = computed(() => {
  const base = properties.alert ? 'mdi-alert-circle' : ''

  switch (properties.file.relationship) {
    case 'root':
      return ''

    case 'git':
      return 'mdi-lock'

    case 'tome':
      return properties.file.expanded ? 'mdi-eye-circle' : 'mdi-minus-circle'

    case 'tome-feature-actions':
    case 'tome-feature-templates':
      return 'mdi-cog'

    case 'tome-action':
      return 'mdi-play-circle'

    case 'tome-template':
      return 'mdi-lightning-bolt-circle'
  }

  if (properties.file.relationship === 'tome-file') {
    switch (properties.file.extension) {
      case '.md':
        return 'mdi-arrow-down-bold-circle'

      case '.js':
        return 'mdi-language-javascript'

      case '.json':
        return 'mdi-code-json'
    }
  }

  return base
})

defineExpose({
  badge,
  icon,
  system,
})
</script>

<style scoped>
.file-icon-disabled,
.file-icon-disabled :deep(*) {
  pointer-events: none !important;
}

* {
  --tome-file-icon-small: 1;
  --tome-file-icon-large: 8;
}

.file-icon-small {
  --tome-file-icon-factor: var(--tome-file-icon-small);
}

.file-icon-large {
  --tome-file-icon-factor: var(--tome-file-icon-large);
}

.file-icon-button {
  --tome-file-icon-button: calc(var(--tome-file-icon-factor) * 20px);

  width: var(--tome-file-icon-button) !important;
  min-width: var(--tome-file-icon-button) !important;
  height: var(--tome-file-icon-button) !important;
  min-height: var(--tome-file-icon-button) !important;
  padding: 0 !important;
}

.file-icon-icon {
  --tome-file-icon-icon: calc(var(--tome-file-icon-factor) * 14px);

  font-size: var(--tome-file-icon-icon) !important;
}

.file-icon-icon-badged {
  --tome-file-icon-icon-badged-circle-x: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 10px));
  --tome-file-icon-icon-badged-circle-y: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 7px));
  --tome-file-icon-icon-badged-gradient: calc(var(--tome-file-icon-factor) * 0.5 * 9px);
  --tome-file-icon-icon-badged-gradient-edge: calc((var(--tome-file-icon-factor) * 0.5 * 9px) + 1px);

  -webkit-mask-image:
    radial-gradient(
      circle at var(--tome-file-icon-icon-badged-circle-x) var(--tome-file-icon-icon-badged-circle-y),
      rgba(0, 0, 0, 0) var(--tome-file-icon-icon-badged-gradient),
      rgba(0, 0, 0, 1) var(--tome-file-icon-icon-badged-gradient-edge)
    );
  mask-image:
    radial-gradient(
      circle at var(--tome-file-icon-icon-badged-circle-x) var(--tome-file-icon-icon-badged-circle-y),
      rgba(0, 0, 0, 0) var(--tome-file-icon-icon-badged-gradient),
      rgba(0, 0, 0, 1) var(--tome-file-icon-icon-badged-gradient-edge)
    );
}

.file-icon-icon-badged.file-icon-expanded {
  --tome-file-icon-icon-badged-circle-y: calc(100% - (var(--tome-file-icon-factor) * 0.5 * 5px));
}

.file-icon-badge {
  --tome-file-icon-badge: calc(var(--tome-file-icon-factor) * 10px);
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 9px);
  --tome-file-icon-badge-gradient: calc(var(--tome-file-icon-factor) * 0.5 * 7px);
  --tome-file-icon-badge-gradient-edge: calc((var(--tome-file-icon-factor) * 0.5 * 7px) + 1px);
  --tome-file-icon-badge-bottom: calc(var(--tome-file-icon-factor) * 0.5 * 3px);
  --tome-file-icon-badge-right: calc(var(--tome-file-icon-factor) * 0.5 * 6px);

  position: absolute;
  width: var(--tome-file-icon-badge) !important;
  min-width: var(--tome-file-icon-badge) !important;
  height: var(--tome-file-icon-badge) !important;
  min-height: var(--tome-file-icon-badge) !important;

  -webkit-mask-image:
    radial-gradient(
      rgba(0, 0, 0, 1) var(--tome-file-icon-badge-gradient),
      rgba(0, 0, 0, 0) var(--tome-file-icon-badge-gradient-edge)
    );
  mask-image:
    radial-gradient(
      rgba(0, 0, 0, 1) var(--tome-file-icon-badge-gradient),
      rgba(0, 0, 0, 0) var(--tome-file-icon-badge-gradient-edge)
    );
  font-size: var(--tome-file-icon-badge-font) !important;
  bottom: var(--tome-file-icon-badge-bottom);
  right: var(--tome-file-icon-badge-right);
}

.file-icon-badge.file-icon-expanded {
  --tome-file-icon-badge-bottom: calc(var(--tome-file-icon-factor) * 0.5px);
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.file-icon-large .modify-cog {
  animation: rotating 2s linear infinite;
}

.modify-book {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 12px) !important;
}

.modify-eye {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 10px) !important;
}

.modify-js {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 11.25px) !important;
}

.modify-lock,
.modify-json {
  --tome-file-icon-badge-font: calc(var(--tome-file-icon-factor) * 7.5px) !important;
}

.file-icon-button:active .modify-lock,
.modify-lock:active {
  color: darkorange !important;
}
</style>
