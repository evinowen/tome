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
          :disabled="index === ''"
          :class="[index === '' ? 'color-picker-disabled-canvas' : '']"
          mode="hex"
          hide-inputs
          width="100%"
          height="100%"
          :model-value="value"
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
            :section="section"
            :label="color.label"
            :index="color.index"
            :theme="theme"
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
import ThemeColorPickerOption from './ThemeColorPickerOption.vue'
import {
  VCol,
  VColorPicker,
  VContainer,
  VList,
  VRow,
} from 'vuetify/components'

export interface Color {
  label: string
  index: string
}

export default {
  components: {
    ThemeColorPickerOption,
    VCol,
    VColorPicker,
    VContainer,
    VList,
    VRow,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'
import { debounce } from 'lodash'
import { presets } from '@/vuetify'
import palette from '@/palette'

const store = fetchStore()
const index = ref('')

interface Properties {
  section: string
  colors: Color[]
}

const properties = withDefaults(defineProps<Properties>(), {
  colors: () => [] as Color[],
})

const theme = computed(() => store.state.configuration.dark_mode ? 'dark' : 'light')
const preset = computed(() => presets[theme.value][palette[properties.section][index.value]])
const value = computed(() => store.state.configuration.themes[theme.value][properties.section][index.value] || preset.value)

async function change (value) {
  if (index.value !== '') {
    await store.dispatch(`configuration/themes/${theme.value}/${properties.section}/update`, { [index.value]: value })
  }
}

const debounce_change = debounce(change, 200)

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
