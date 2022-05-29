<template>
  <v-menu tile top offset-y
    :value=value @input="value = !value"
    transition="slide-y-reverse-transition"
    content-class="menu"
    :close-on-content-click="false"
     width="50%"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn tile small class="button pa-0 px-2" v-on="on" v-bind="attrs" :disabled=disabled>
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
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text :disabled="!readme" @click="open(readme)">
          Read Me
        </v-btn>
        <v-spacer></v-spacer>
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

<script>
import { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu } from 'vuetify/lib'
export default {
  components: { VCardActions, VCard, VCardTitle, VBtn, VSpacer, VDivider, VCardSubtitle, VMenu },
  props: {
    name: { type: String, default: '' },
    path: { type: String, default: '' },
    readme: { type: String },
    authors: { type: String },
    contributors: { type: String },
    license: { type: String },
    disabled: { type: Boolean, default: false }
  },
  data: () => ({
    value: false
  }),
  methods: {
    open: function (path) {
      this.value = false
      this.$emit('open', path)
    }
  }
}
</script>
