<template>
  <v-list dense v-if="configuration">
    <v-list-item>
      <v-text-field small label="Name" v-model="configuration.name" @change="counter_start('settings')" />
    </v-list-item>
    <v-list-item>
      <v-text-field small label="E-Mail" v-model="configuration.email" @change="counter_start('settings')" />
    </v-list-item>
    <v-list-item>
      <v-container class="pa-0 mb-2">
        <div class="overline">Private Key</div>
        <input ref="private_key" type="file" style="display: none" @change="assign_key('private_key', $event)" />
        <v-btn tile icon small :color="configuration.private_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.private_key.click()">
          <v-icon small>{{ configuration.private_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
          {{ configuration.private_key }}
        </v-btn>
      </v-container>
    </v-list-item>
    <v-list-item>
      <v-container class="pa-0 mb-2">
        <div class="overline">Public Key</div>
        <input ref="public_key" type="file" style="display: none" @change="assign_key('public_key', $event)" />
        <v-btn tile icon small :color="configuration.public_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.public_key.click()">
          <v-icon small>{{ configuration.public_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
          {{ configuration.public_key }}
        </v-btn>
      </v-container>
    </v-list-item>
    <v-list-item>
      <v-text-field
        v-model="configuration.passphrase"
        label="passphrase" small clearable
        :append-icon="obscure_passphrase ? 'mdi-eye-off' : 'mdi-eye'"
        :type="obscure_passphrase ? 'password' : 'text'"
        @click:append="obscure_passphrase = !obscure_passphrase"
        @change="counter_start('settings')"
      />
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item>
      <v-switch v-model="configuration.format_titles" label="Format Titles" @change="counter_start('settings')"></v-switch>
    </v-list-item>
  </v-list>
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
import store from '@/store'

export default {
  props: {
    source: String
  },
  data: () => ({
    open: false,
    obscure_passphrase: true,
    triggered: false,
    counter: 0,
    max: 3
  }),
  computed: {
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    }
  }
}
</script>
