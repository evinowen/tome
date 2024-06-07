<template>
  <div>
    <setting-frame
      :label="label"
      :detail="detail"
      :index="index"
    >
      <v-text-field
        ref="input-field"
        density="compact"
        :suffix="suffix"
        style="width: 120px"
        hide-details
        :disabled="disabled"
        :model-value="model"
        @update:model-value="(value) => update(Number(value))"
      />
    </setting-frame>
    <v-slider
      v-if="slider"
      v-model="slider_model"
      :disabled="disabled"
      :min="slider[0]"
      :max="slider[1]"
      show-ticks="always"
      :step="slider[2]"
      tick-size="4"
      hide-details
      @update:model-value="update"
    />
  </div>
</template>

<script setup lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VTextField,
  VSlider,
} from 'vuetify/components'

import { ref, watch } from 'vue'
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'

interface Properties extends SettingProperties {
  // eslint-disable-next-line vue/require-default-prop
  suffix?: string
  // eslint-disable-next-line vue/require-default-prop
  slider?: number[]
}

const properties = withDefaults(defineProps<Properties>(), {
  ...SettingPropertiesDefaults(),
  suffix: 'px',
  slider: undefined,
})

const { model, disabled, update } = SettingSetup<number>(properties, 500, 0)

const slider_model = ref<number>(model.value)
watch(model, (value) => slider_model.value = value)

defineExpose({
  update,
  slider_model,
})
</script>
