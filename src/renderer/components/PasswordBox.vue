<template>
  <overlay-box
    :visible="repository_credentials.visible"
  >
    <v-card
      title="Password"
      subtitle="Please provide the password for your credentials."
    >
      <template #prepend>
        <v-avatar color="warning">
          <v-icon>mdi-lock</v-icon>
        </v-avatar>
      </template>
      <text-input
        ref="input"
        :value="model"
        obscureable
        @update="(value) => model = value"
        @submit="submit"
      />
      <v-card-actions>
        <v-btn
          ref="submit-button"
          @click="submit"
        >
          <v-icon class="mr-2">
            mdi-key
          </v-icon>
          Submit
        </v-btn>
        <v-spacer />
        <v-btn
          ref="cancel-button"
          @click="close"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </overlay-box>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'
import OverlayBox from '@/components/OverlayBox.vue'
import TextInput from '@/components/Input/TextInput.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VIcon,
  VSpacer,
} from 'vuetify/components'

const repository_credentials = fetch_repository_credentials_store()
const input = ref<InstanceType<typeof TextInput>>()
const model = ref('')

watch(() => repository_credentials.visible, () => {
  model.value = ''

  if (repository_credentials.visible) {
    input.value.focus()
  }
})

async function submit () {
  await repository_credentials.submit(model.value)
}

async function close () {
  repository_credentials.cancel()
}

defineExpose({
  close,
  model,
  submit,
})
</script>
