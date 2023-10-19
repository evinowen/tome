<template>
  <v-btn
    rounded="0"
    size="small"
    variant="flat"
    class="console-button"
    :color="status === 'error' ? 'error' : ''"
  >
    <v-icon size="small">
      {{ status === 'error' ? 'mdi-exclamation-thick' : 'mdi-chevron-right' }}
    </v-icon>&nbsp;{{ message }}
  </v-btn>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VBtn, VIcon } from 'vuetify/components'

@Component({
  components: {
    VBtn,
    VIcon
  }
})
class ConsoleButton extends Vue {
  @Prop({ default: '' })
  status: string

  @Prop({ default: '' })
  message: string
}

export default toNative(ConsoleButton)
</script>

<style scoped>

.console-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 30px;
  justify-content: left;
  flex-grow: 1;
  font-size: 0.8em;
}

.console-button span {
  width: 100%;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  padding: 0 4px !important;
}
</style>
