<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col>
        <input ref="input" type="file" style="display: none" @change="input" />
        <v-btn tile icon small dark :color=color class="pa-0" @click.stop="$refs.input.click()">
          <v-icon small>{{ value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
          {{ value }}
        </v-btn>
      </v-col>
      <v-col cols=1>
        <v-btn tile icon small dark :color=button_color class="pa-0" @click.stop="$emit('input', stored)">
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
export default {
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
    proxy_file: function (event) {
      const files = event.target.files || event.dataTransfer.files

      return files.length ? files[0] : null
    },
    input: async function (event) {
      const file = this.proxy_file(event)

      if (!file.path) {
        return
      }

      this.$emit('input', file.path)
    }
  }
}
</script>
