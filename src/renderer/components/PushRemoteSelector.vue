<template>
  <v-card dense class="my-2">
    <v-card-title class="pa-2">
      Remote
    </v-card-title>
    <v-card-actions>
      <v-select
        ref="select"
        :value=value
        :items="items"
        item-value="name"
        label="Remote"
        dense
        clearable class="mt-4" @change="$emit('input', $event)"
      >
        <template #selection="data">
          {{ data.item.name }}
          <v-spacer />
          <small>{{ data.item.url }}</small>
        </template>
        <template #item="data">
          {{ data.item.name }}
          <v-spacer />
          {{ data.item.url }}
        </template>
        <template #append-outer>
          <v-btn icon :color="edit ? 'warning' : 'darken-1'" @click.stop="edit = !edit">
            <v-icon>mdi-square-edit-outline</v-icon>
          </v-btn>
        </template>
      </v-select>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="edit" class="px-6">
        <form>
          <v-row dense background="red">
            <v-col cols="12" sm="3">
              <v-text-field
                v-model="form.name"
                label="Name"
                required dense
              />
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="form.url"
                label="URL"
                required dense
                append-outer-icon="mdi-plus-thick"
              >
                <template #append-outer>
                  <v-btn ref="create" icon color="success" @click.stop="create">
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
import Vue from 'vue'
import { VTextField, VCol, VRow, VExpandTransition, VSelect, VCardActions, VCard, VCardTitle, VBtn, VIcon, VSpacer } from 'vuetify/lib'
export default Vue.extend({
  components: { VTextField, VCol, VRow, VExpandTransition, VSelect, VCardActions, VCard, VCardTitle, VBtn, VIcon, VSpacer },
  props: {
    value: { type: String, default: '' },
    items: { type: Array, default: () => [] }
  },
  data: () => ({
    edit: false,
    form: {
      name: '',
      url: ''
    }
  }),
  methods: {
    create: async function () {
      this.$emit('create', this.form.name, this.form.url)
    },
    input: async function (remote) {
      this.$emit('input', remote)
    }
  }
})
</script>