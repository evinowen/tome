<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col>
        <input ref="input" type="file" style="display: none" @change="input" />
        <v-btn tile icon small :color=color class="pa-0" @click.stop="$refs.input.click()">
          <v-icon small>{{ value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
          {{ value }}
        </v-btn>
      </v-col>
      <v-col cols=1>
        <v-btn tile icon small :color=button_color class="pa-0" @click.stop="$emit('input', stored)">
          <v-icon small>mdi-key</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-btn {
  width: 100%;
  text-align: left;
}
</style>

<script>
import { VContainer, VRow, VCol, VBtn, VIcon } from 'vuetify/lib'

export default {
  components: { VContainer, VRow, VCol, VBtn, VIcon },
  props: {
    value: { type: String, default: '' },
    stored: { type: String, default: '' },
    label: { type: String, default: '' },
    id: { type: String, default: '' }
  },
  computed: {
    color: function () {
      return this.value ? 'green' : 'red'
    },
    button_color: function () {
      return this.stored ? 'orange' : 'grey'
    }
  },
  methods: {
    input: async function (event) {
      const files = event.target.files || event.dataTransfer.files
      const file = files.length ? files[0] : null

      if (!file.path) {
        return
      }

      this.$emit('input', file.path)
    }
  }
}
</script>
