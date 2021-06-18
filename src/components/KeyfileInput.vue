<template>
  <v-container class="pa-0 mb-2">
    <div class="overline">{{ label }}</div>
    <input ref="input" type="file" style="display: none" @change="input($event)" />
    <v-btn tile icon small :color="value ? 'green' : 'red'" class="key-input" @click.stop="$refs.input.click()">
      <v-icon small>{{ value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
      {{ value }}
    </v-btn>
  </v-container>
</template>

<style>
.key-input {
  width: 100% !important;
  padding: 0;
  height: 48px !important;
  font-size: 0.9em !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.key-input .v-icon {
  height: 28px !important;
  width: 28px !important;
  font-size: 2.0em !important;
}

.key-input span {
  width: 100% !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  justify-content: normal;
}
</style>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' }
  },
  methods: {
    proxy_file: function (event) {
      const files = event.target.files || event.dataTransfer.files

      return files.length ? files[0] : null
    },
    input: async function (event) {
      const file = this.proxy_file(event)

      this.$emit('input', file.path)
    }
  }
}
</script>
