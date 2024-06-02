<template>
  <overlay-box
    :visible="visible"
    :secure="false"
    @click="close"
  >
    <v-card style="width: 360px; max-width: 90vw !important;">
      <v-list-item class="my-2">
        <template #prepend>
          <v-avatar
            color="primary"
          >
            <v-icon>mdi-tag</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5 title">
          Tag Commit
        </v-list-item-title>
        <v-list-item-subtitle>
          Add tag for commit <span class="monospace">{{ oid.substring(0, 7) }}</span>
        </v-list-item-subtitle>
      </v-list-item>

      <v-card-text>
        <v-text-field
          v-model="model"
          @keydown.enter="model !== '' ? create() : ''"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          ref="create-button"
          color="warning"
          variant="text"
          :disabled="model === ''"
          @click="create"
        >
          <v-progress-circular
            :size="12"
            :width="2"
            color="warning"
            class="mr-2"
          />
          Create
        </v-btn>
        <v-spacer />
        <v-btn
          ref="cancel-button"
          color="darken-1"
          variant="text"
          @click="close"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </overlay-box>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import OverlayBox from '@/components/OverlayBox.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VIcon,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
  VProgressCircular,
  VSpacer,
  VTextField,
} from 'vuetify/components'

export interface Properties {
  visible?: boolean
  oid?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  visible: false,
  oid: '',
})

const emit = defineEmits([
  'create',
  'close',
])

const model = ref('')

watch(() => properties.visible, () => {
  if (properties.visible) {
    model.value = ''
  }
})

function create () {
  close()
  emit('create', model.value)
}

function close () {
  emit('close')
}

defineExpose({
  model,
})
</script>

<style scoped>
.monospace {
  font-family: monospace;
  text-transform: uppercase;
}
</style>
