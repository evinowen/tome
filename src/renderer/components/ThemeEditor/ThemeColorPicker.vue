<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        cols="0"
        md="1"
        lg="2"
      />
      <v-col
        class="pa-4"
        cols="12"
        sm="7"
        md="6"
        lg="5"
      >
        <v-color-picker
          v-model="model"
          :disabled="index === ''"
          :class="[index === '' ? 'color-picker-disabled-canvas' : '']"
          mode="hex"
          hide-inputs
          width="100%"
          height="100%"
          @update:model-value="debounce_change"
        />
      </v-col>
      <v-col
        cols="12"
        sm="5"
        md="4"
        lg="3"
        style="max-height: 480px; overflow-y: auto;"
      >
        <v-list
          mandatory
          :model-value="index"
          @click:select="({id}) => index = String(id)"
        >
          <theme-color-picker-option
            v-for="color in colors"
            :key="color.index"
            :theme="theme"
            :section="section"
            :label="color.label"
            :index="color.index"
          />
        </v-list>
      </v-col>
      <v-col
        cols="0"
        md="1"
        lg="2"
      />
    </v-row>
  </v-container>
</template>

<script lang="ts">
export interface Color {
  label: string
  index: string
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { debounce } from 'lodash'
import { presets } from '@/vuetify'
import palette from '@/palette'
import ThemeColorPickerOption from './ThemeColorPickerOption.vue'
import {
  VCol,
  VColorPicker,
  VContainer,
  VList,
  VRow,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const index = ref('')

interface Properties {
  theme: string
  section: string
  colors: Color[]
}

const properties = withDefaults(defineProps<Properties>(), {
  theme: 'light',
  colors: () => [] as Color[],
})

const preset = computed(() => {
  return presets[properties.theme][palette[properties.section][index.value]]
})
const stored = computed(() => configuration[configuration.target].themes[properties.theme][properties.section][index.value] || preset.value)
const model = ref(stored.value)

watch(() => stored.value, () => {
  model.value = stored.value
})

async function change (value) {
  if (index.value !== '') {
    await configuration.update(configuration.target, `themes.${properties.theme}.${properties.section}.${index.value}`, value)
  }
}

const debounce_change = debounce(change, 500)

defineExpose({
  index,
  model,
  change,
})
</script>

<style scoped>
:deep(.v-color-picker) {
  display: flex;
  flex-direction: column;
}

.color-picker-disabled-canvas :deep(canvas) {
  display: none;
}

:deep(.v-color-picker-canvas) {
  flex-grow: 1;
  flex-shrink: 0;
  height: 256px;
}

:deep(v-color-picker__controls) {
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
