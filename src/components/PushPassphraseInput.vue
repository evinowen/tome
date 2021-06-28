<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <v-col>
        <v-text-field
          :value="value"
          @input="$emit('input', $event)"
          :append-icon="obscured ? 'mdi-eye-off' : 'mdi-eye'"
          :type="obscured ? 'password' : 'text'"
          solo dense filled flat x-small clearable
          height=28 class="passphrase" style="min-height: 0px;"
          @click:append="obscured = !obscured"
          hint="passphrase"
        />
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
.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}

.v-btn {
  width: 100%;
  text-align: left;
}
</style>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    stored: { type: String, default: '' }
  },
  data: () => ({
    obscured: false
  }),
  watch: {
    value: function (value) { this.open = value }
  },
  computed: {
    button_color: function () {
      return this.stored ? 'orange' : 'grey'
    }
  }
}
</script>
