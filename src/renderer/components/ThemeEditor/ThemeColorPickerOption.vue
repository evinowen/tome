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
          v-show="enabled && (preset != value)"
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
          background: enabled ? value : preset,
        }"
      />
    </template>
  </v-list-item>
</template>

<script lang="ts">
import {
  VBtn,
  VCheckboxBtn,
  VListItem,
  VListItemAction,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VCheckboxBtn,
    VListItem,
    VListItemAction,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import { presets } from '@/vuetify'
import palette from '@/palette'

const store = fetchStore()

interface Properties {
  section: string
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  section: '',
  label: '',
  index: '',
})

const theme = computed(() => store.state.configuration.dark_mode ? 'dark' : 'light')

const value = computed(() => store.state.configuration.themes[theme.value][properties.section][properties.index])
const enabled = computed(() => value.value !== '')
const preset = computed(() => presets[theme.value][palette[properties.section][properties.index]])

async function toggle () {
  // eslint-disable-next-line unicorn/prefer-ternary
  if (enabled.value) {
    await store.dispatch(`configuration/themes/${theme.value}/${properties.section}/update`, { [properties.index]: '' })
  } else {
    await reset()
  }
}

async function reset () {
  await store.dispatch(`configuration/themes/${theme.value}/${properties.section}/update`, { [properties.index]: preset.value })
}
</script>
