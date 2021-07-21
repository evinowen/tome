<template>
  <v-container fluid class="pa-0 mb-2">
    <input ref="input" type="file" style="display: none" @change="input($event)" />
    <v-label for=id small><span style="font-size: 0.75em;">{{ label }}</span></v-label>
    <v-btn id=id tile icon small :color=color class="key-input" @click.stop="$refs.input.click()">
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
    label: { type: String, default: '' },
    id: { type: String, default: '' }
  },
  computed: {
    color: function () {
      return this.value ? 'green' : 'red'
    }
  },
  methods: {
    input: async function (event) {
      const files = event.target.files || event.dataTransfer.files
      const file = files.length ? files[0] : null

      this.$emit('input', file.path)
    }
  }
}
</script>
