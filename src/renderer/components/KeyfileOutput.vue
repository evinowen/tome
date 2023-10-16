<template>
  <v-layout class="key-border pt-1">
    <v-col class="pa-1">
      <v-text-field
        :model-value="value || ' '"
        :label="label"
        class="key-output"
        readonly
        variant="outlined"
        hide-details
      />
    </v-col>
    <v-btn
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="copy"
    >
      <v-icon size="small">
        mdi-content-copy
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VIcon, VBtn, VTextField, VLayout, VCol } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VIcon, VBtn, VTextField, VLayout, VCol }
})
class KeyfileOutput extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: '' })
  value: string

  @Prop({ default: false })
  small: boolean

  @Prop({ default: '' })
  label: string

  async copy () {
    await this.store.dispatch('clipboard/text', this.value)
  }
}

export default toNative(KeyfileOutput)
</script>

<style scoped>
.key-output {
  font-family: monospace !important;
}
</style>
