<template>
  <div class="d-flex key-border align-center">
    <div
      v-if="frame"
      class="flex-shrink-0 pa-2 pl-4 mr-2"
    >
      <div
        v-if="local"
        ref="checkbox-input"
        :class="[
          'checkbox',
          { 'checkbox-checked': !disabled },
        ]"
        @click="update(disabled)"
      >
        <v-icon v-if="disabled">
          mdi-checkbox-blank-outline
        </v-icon>
        <v-icon v-else>
          mdi-checkbox-marked
        </v-icon>
      </div>
      <div v-else>
        <v-icon
          v-if="localized"
          style="opacity: 0.6"
        >
          mdi-earth-off
        </v-icon>
        <v-icon v-else>
          mdi-earth
        </v-icon>
      </div>
    </div>
    <div
      :class="[
        'flex-shrink-0',
        { 'flex-grow-1': !(label || detail) }
      ]"
    >
      <div
        class="pa-1 mr-2"
        style="min-width: 160px"
      >
        <div :class="[ {'float-box': float } ]">
          <slot />
        </div>
      </div>
    </div>
    <div
      v-if="(label || detail)"
      class="flex-grow-1 pa-1 d-flex flex-column"
      :style="{ 'opacity': disabled ? 0.6 : 1 }"
    >
      <strong>{{ label }}</strong>
      {{ detail }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import {
  VIcon,
} from 'vuetify/components'

interface Properties {
  label?: string
  detail?: string
  index: string
  frame?: boolean
  float?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
  frame: true,
  float: true,
})

const configuration = fetch_configuration_store()
const local = computed(() => configuration.target === SettingsTarget.Local)
const localized = computed(() => configuration.localized[properties.index])
const disabled = computed(() => local.value && !localized.value)

async function update (value: boolean) {
  await configuration.localize(properties.index, value)
}

defineExpose({
  disabled,
  update,
})
</script>

<style scoped>
.checkbox {
  cursor: pointer;
  opacity: 0.6;
  transition: all 250ms linear;
}

.checkbox-checked {
  opacity: 0.8;
}

.checkbox:hover {
  opacity: 1;
}

.float-box {
  display: flex;
  justify-content: center;
}
</style>
