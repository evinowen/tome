<template>
  <v-list-item
    :value="index"
    :title="label"
  >
    <template #prepend>
      <v-list-item-action start>
        <v-checkbox-btn
          :model-value="enabled"
          @update:model-value="toggle"
        />
      </v-list-item-action>
    </template>
    <template #append>
      <v-list-item-action end>
        <v-btn
          v-show="enabled && (preset != stored)"
          icon="mdi-undo"
          variant="plain"
          density="compact"
          @click="reset"
        />
      </v-list-item-action>
      <div
        class="ml-4"
        :style="{
          width: '16px',
          height: '16px',
          outline: '2px solid rgba(var(--v-theme-on-surface))',
          background: enabled ? stored : preset,
        }"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { presets } from '@/vuetify'
import palette from '@/palette'
import {
  VBtn,
  VCheckboxBtn,
  VListItem,
  VListItemAction,
} from 'vuetify/components'

const configuration = fetch_configuration_store()

interface Properties {
  theme: string
  section: string
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  theme: 'light',
  section: '',
  label: '',
  index: '',
})

const stored = computed(() => configuration[configuration.target].themes[properties.theme][properties.section][properties.index])
const enabled = computed(() => stored.value !== '')
const preset = computed(() => presets[properties.theme][palette[properties.section][properties.index]])

async function toggle () {
  // eslint-disable-next-line unicorn/prefer-ternary
  if (enabled.value) {
    await configuration.update(configuration.target, `themes.${properties.theme}.${properties.section}.${properties.index}`, '')
  } else {
    await reset()
  }
}

async function reset () {
  await configuration.update(configuration.target, `themes.${properties.theme}.${properties.section}.${properties.index}`, preset.value)
}

defineExpose({
  enabled,
  toggle,
  reset,
})
</script>
