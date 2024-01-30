<template>
  <v-card
    dense
    class="my-2"
  >
    <v-card-title class="pa-2">
      Remote
    </v-card-title>
    <v-card-actions>
      <v-select
        ref="select"
        :model-value="value"
        :items="items"
        item-value="name"
        item-title="name"
        item-props
        label="Remote"
        clearable
        class="mt-4"
        @update:model-value="input"
      >
        <template #selection="{ item }">
          <v-list-item
            :title="item.raw.name"
            :subtitle="item.raw.url"
          />
        </template>
        <template #item="{ props, item }">
          <v-list-item
            v-bind="props"
            :subtitle="item.raw.url"
          />
        </template>
        <template #append>
          <v-btn
            ref="edit-button"
            icon
            :color="edit ? 'warning' : 'darken-1'"
            @click.stop="edit = !edit"
          >
            <v-icon>mdi-square-edit-outline</v-icon>
          </v-btn>
        </template>
      </v-select>
    </v-card-actions>

    <v-expand-transition>
      <div
        v-show="edit"
        class="px-6"
      >
        <form>
          <v-row
            class="background"
            dense
          >
            <v-col
              cols="12"
              sm="3"
            >
              <v-text-field
                ref="form-name"
                :model-value="form.name"
                label="Name"
                required
                density="compact"
                @update:model-value="form.name = $event"
              />
            </v-col>
            <v-col
              cols="12"
              sm="9"
            >
              <v-text-field
                ref="form-url"
                :model-value="form.url"
                label="URL"
                required
                density="compact"
                append-icon="mdi-plus-thick"
                @update:model-value="form.url = $event"
              >
                <template #append-outer>
                  <v-btn
                    ref="create"
                    icon
                    color="success"
                    @click.stop="create"
                  >
                    <v-icon>mdi-plus-thick</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </form>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts">
import {
  VBtn,
  VCard,
  VCardActions,
  VCardTitle,
  VCol,
  VExpandTransition,
  VIcon,
  VListItem,
  VRow,
  VSelect,
  VTextField,
} from 'vuetify/components'
import { RepositoryRemote } from '@/store/modules/repository'

export default {
  components: {
    VBtn,
    VCard,
    VCardActions,
    VCardTitle,
    VCol,
    VExpandTransition,
    VIcon,
    VListItem,
    VRow,
    VSelect,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'

export interface Properties {
  value?: string
  items?: RepositoryRemote[]
}

withDefaults(defineProps<Properties>(), {
  value: '',
  items: () => [],
})

const emit = defineEmits([
  'create',
  'input',
])

const edit = ref(false)
const form = reactive({
  name: ref(''),
  url: ref(''),
})

async function create () {
  emit('create', form.name, form.url)
}

async function input (remote) {
  emit('input', remote)
}

defineExpose({
  create,
  edit,
  form,
  input,
})
</script>
