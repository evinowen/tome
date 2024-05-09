<template>
  <div>
    <setting-frame
      :label="label"
      :detail="detail"
    >
      <v-text-field
        density="compact"
        :suffix="suffix"
        style="width: 120px"
        hide-details
        :model-value="primary_model"
        @update:model-value="debounce_update"
      />
    </setting-frame>
    <v-slider
      v-if="slider"
      :min="slider[0]"
      :max="slider[1]"
      show-ticks="always"
      :step="slider[2]"
      tick-size="4"
      hide-details
      v-model="slider_model"
      @update:model-value="debounce_update"
    />
  </div>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VTextField,
  VSlider,
} from 'vuetify/components'

export default {
  components: {
    SettingFrame,
    VTextField,
    VSlider,
  },
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchStore } from '@/store'
import { debounce } from 'lodash'

interface Properties {
  label: string
  detail: string
  index: string
  suffix?: string
  slider?: number[]
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
  suffix: 'px',
  slider: undefined,
})

const store = fetchStore()
const primary_model = computed<number>(() => store.state.configuration[properties.index])
const slider_model = ref<number>(primary_model.value)

watch(primary_model, (value) => slider_model.value = value)

async function update (value: string | number) {
  await store.dispatch('configuration/update', { [properties.index]: Number(value) })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
