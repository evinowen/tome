<template>
  <v-navigation-drawer v-model=open @input="$emit('input', $event)" fixed stateless width="100%" style="z-index: 1000; height: auto; top: 25px; bottom: 18px">
    <v-list dense v-if="configuration">
      <v-list-item>
        <v-text-field small label="name" :value=configuration.name @input="assign_value('name', $event)" />
      </v-list-item>
      <v-list-item>
        <v-text-field small label="e-mail" :value=configuration.email @input="assign_value('email', $event)" />
      </v-list-item>
      <v-list-item>
        <keyfile-input label="private key" id="settings_private_key" :value=configuration.private_key @input=assign_key />
      </v-list-item>
      <v-list-item>
        <keyfile-input label="public key" id="settings_public_key" :value=configuration.public_key @input=assign_key />
      </v-list-item>
      <v-list-item>
        <v-text-field
          :value=configuration.passphrase
          label="passphrase" small clearable
          :append-icon="obscure_passphrase ? 'mdi-eye-off' : 'mdi-eye'"
          :type="obscure_passphrase ? 'password' : 'text'"
          @click:append="obscure_passphrase = !obscure_passphrase"
          @change=save
        />
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-switch :value=configuration.format_titles label="Format Titles" @change="assign_value('format_titles', $event || false)"></v-switch>
      </v-list-item>
      <v-list-item>
        <v-switch :value=configuration.dark_mode label="Dark Mode" @change="assign_value('dark_mode', $event || false)"></v-switch>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
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
import KeyfileInput from './KeyfileInput.vue'

export default {
  components: { KeyfileInput },
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    open: false,
    obscure_passphrase: true,
    triggered: false,
    counter: 0,
    max: 3,
    queue: true,
    process: null
  }),
  computed: {
    configuration: function () {
      return store.state.configuration
    }
  },
  watch: {
    value: function (value) { this.open = value }
  },
  methods: {
    proxy_file: function (event) {
      const files = event.target.files || event.dataTransfer.files

      return files.length ? files[0] : null
    },
    assign_key: async function (name, event) {
      const file = this.proxy_file(event)

      await store.dispatch('configuration/update', { [name]: file.path })
      this.save()
    },
    assign_value: async function (name, event) {
      console.log('assign_value', name, event)
      await store.dispatch('configuration/update', { [name]: event })
      this.save()
    },
    save: async function () {
      if (this.process) {
        if (this.queue) {
          this.queue = false
          await this.process
        } else {
          return
        }
      }

      this.process = store.dispatch('configuration/write', store.state.configuration_path)
      this.queue = true
    }
  }
}
</script>
