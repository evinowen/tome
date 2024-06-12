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
import File, { FileRelationshipType } from '@/objects/File'

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
