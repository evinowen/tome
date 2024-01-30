<template>
  <v-layout>
    <v-col class="pa-1">
      <v-text-field
        :model-value="value"
        :type="obscured ? 'password' : 'text'"
        variant="outlined"
        hide-details
        density="compact"
        label="passphrase"
        @update:model-value="$emit('input', $event)"
      />
    </v-col>
    <v-btn
      ref="clear"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      ref="display"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      @click.stop="obscured = !obscured"
    >
      <v-icon size="small">
        {{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}
      </v-icon>
    </v-btn>
    <v-btn
      v-if="storable"
      ref="load"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="stored === ''"
      @click.stop="$emit('input', stored)"
    >
      <v-icon size="small">
        mdi-cog
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
import {
  VBtn,
  VCol,
  VIcon,
  VLayout,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VCol,
    VIcon,
    VLayout,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

export interface Properties {
  value?: string
  storable?: boolean
  stored?: string
}

withDefaults(defineProps<Properties>(), {
  value: '',
  storable: false,
  stored: '',
})

const obscured = ref(true)

defineExpose({
  obscured,
})
</script>
