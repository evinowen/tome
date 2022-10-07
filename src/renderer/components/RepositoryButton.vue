<template>
  <v-menu tile top offset-y
          :value=value transition="slide-y-reverse-transition"
          content-class="menu"
          :close-on-content-click="false"
          width="50%"
          @input="value = !value"
  >
    <template #activator="{ on, attrs }">
      <v-btn tile small class="button pa-0 px-2" v-bind="attrs" :disabled=disabled v-on="on">
        {{ name }}
      </v-btn>
    </template>

    <v-card tile>
      <v-card-title>{{ name }}</v-card-title>
      <v-card-subtitle>{{ path }}</v-card-subtitle>
      <v-card-actions>
        <v-btn text :disabled="!license" @click="open(license)">
          License
        </v-btn>
      </v-card-actions>
      <v-divider />
      <v-card-actions>
        <v-btn text :disabled="!readme" @click="open(readme)">
          Read Me
        </v-btn>
        <v-spacer />
        <v-btn text :disabled="!authors" @click="open(authors)">
          Authors
        </v-btn>
        <v-btn text :disabled="!contributors" @click="open(contributors)">
          Contributors
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style scoped>
.button {
  height: 18px !important;
}

.menu {
  left: 2px !important;
  top: auto !important;
  bottom: 21px !important;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu } from 'vuetify/lib'
import store from '@/store'

export default Vue.extend({
  components: { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu },
  props: {
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    readme: { type: String, default: '' },
    authors: { type: String, default: '' },
    contributors: { type: String, default: '' },
    license: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  data: () => ({
    value: false
  }),
  methods: {
    open: async function (path) {
      this.value = false
      await store.dispatch('files/select', { path })
    }
  }
})
</script>
