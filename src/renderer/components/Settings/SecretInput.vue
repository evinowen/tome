<template>
  <setting-frame
    :index="index"
    :frame="frame"
  >
    <text-input
      ref="input-field"
      style="width: 100%"
      :disabled="prompt || disabled"
      :error="error"
      :value="model"
      :label="label"
      :obscureable="true"
      :placeholder="placeholder"
      @update="update"
    >
      <template #prepend>
        <v-btn
          ref="prompt-button"
          rounded="0"
          icon
          style="height: 100%;"
          @click="update_prompt(!prompt)"
        >
          <v-icon size="small">
            {{ prompt ? 'mdi-archive-off' : 'mdi-archive' }}
          </v-icon>
        </v-btn>
      </template>
    </text-input>
  </setting-frame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { get } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import TextInput from '@/components/Input/TextInput.vue'
import SettingFrame from '@/components/Settings/SettingFrame.vue'
import SettingSetup, { SettingProperties, SettingPropertiesDefaults } from '@/components/Settings/SettingSetup'
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

interface Properties extends SettingProperties {
  prompt_index: string
  error?: boolean
  // eslint-disable-next-line vue/require-default-prop
  placeholder?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  ...SettingPropertiesDefaults(),
  error: false,
  placeholder: '',
})

const configuration = fetch_configuration_store()
const { model, disabled, update } = SettingSetup<string>(properties, 500, '')

const prompt = computed(() => get(configuration[properties.target || configuration.target], properties.prompt_index))
async function update_prompt (value) {
  await configuration.update(properties.target || configuration.target, properties.prompt_index, value)

  if (value) {
    await update('')
  }
}

defineExpose({
  prompt,
  update,
})
</script>
