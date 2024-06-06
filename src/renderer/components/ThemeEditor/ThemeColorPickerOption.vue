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
import { fetch_configuration_store } from '@/store/modules/configuration'
import { presets } from '@/vuetify'
import palette from '@/palette'

const configuration = fetch_configuration_store()

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

const theme = computed(() => configuration[configuration.target].dark_mode ? 'dark' : 'light')

const value = computed(() => configuration[configuration.target].themes[theme.value][properties.section][properties.index])
const enabled = computed(() => value.value !== '')
const preset = computed(() => presets[theme.value][palette[properties.section][properties.index]])

async function toggle () {
  // eslint-disable-next-line unicorn/prefer-ternary
  if (enabled.value) {
    // await configuration.update(configuration.target, { themes: { [theme.value]: { [properties.section]: { [properties.index]: '' } } } })
    await configuration.update(configuration.target, `themes.${theme.value}.${properties.section}.${properties.index}`, '')
  } else {
    await reset()
  }
}

async function reset () {
  // await configuration.update(configuration.target, { themes: { [theme.value]: { [properties.section]: { [properties.index]: preset.value } } } })
  await configuration.update(configuration.target, `themes.${theme.value}.${properties.section}.${properties.index}`, preset.value)
}
</script>
