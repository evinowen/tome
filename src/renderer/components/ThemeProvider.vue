<template>
  <v-theme-provider
    :theme="view_theme"
  >
    <v-sheet
      class="theme-provider"
      :style="style"
    >
      <slot />
    </v-sheet>
  </v-theme-provider>
</template>

<script setup lang="ts">
import {
  VThemeProvider,
  VSheet,
} from 'vuetify/components'

import { computed } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'

export interface Properties {
  theme?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  theme: 'active',
})

const configuration = fetch_configuration_store()

const default_font = 'Montserrat'

const view_theme = computed(() => {
  return properties.theme === 'active'
    ? (configuration.active.dark_mode ? 'dark' : 'light')
    : `${properties.theme}-${configuration.target}`
})

const computed_theme = computed(() => {
  return properties.theme === 'active'
    ? configuration[configuration.target].themes[configuration.active.dark_mode ? 'dark' : 'light']
    : configuration[configuration.target].themes[properties.theme]
})

const style = computed(() => ({
  '--font-application-title': computed_theme.value.application.font_family_title || default_font,
  '--font-application-title-size': `${computed_theme.value.application.font_size_title}em`,
  '--font-application-content': computed_theme.value.application.font_family_content || default_font,
  '--font-application-content-size': `${computed_theme.value.application.font_size_content}em`,
  '--font-application-monospace': computed_theme.value.application.font_family_monospace || 'monospace',
  '--font-application-monospace-size': `${computed_theme.value.application.font_size_monospace}em`,
  '--font-rendered-header': computed_theme.value.rendered.font_family_header || default_font,
  '--font-rendered-header-size': `${computed_theme.value.rendered.font_size_header}em`,
  '--font-rendered-content': computed_theme.value.rendered.font_family_content || default_font,
  '--font-rendered-content-size': `${computed_theme.value.rendered.font_size_content}em`,
  '--font-compose': computed_theme.value.compose.font_family_compose || 'monospace',
  '--font-compose-size': `${computed_theme.value.compose.font_size_compose || 1}em`,
}))

defineExpose({
  view_theme,
  computed_theme,
})
</script>

<style scoped>
.theme-provider {
  font-family: var(--font-application-content);
  font-size: var(--font-application-content-size);
}

.theme-provider :deep(.title) {
  font-family: var(--font-application-title) !important;
  font-size: var(--font-application-title-size);
}

.theme-provider :deep(pre) {
  font-family: var(--font-application-monospace);
  font-size: var(--font-application-monospace-size);
}
</style>
