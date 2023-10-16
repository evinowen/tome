<template>
  <v-layout>
    <v-col class="pa-1">
      <v-text-field
        :model-value="value"
        :type="obscured ? 'password' : 'text'"
        variant="outlined"
        hide-details
        density="compact"
        label="passphrase"
        @update:model-value="$emit('input', $event)"
      />
    </v-col>
    <v-btn
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      @click.stop="obscured = !obscured"
    >
      <v-icon size="small">
        {{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}
      </v-icon>
    </v-btn>
    <v-btn
      v-if="storable"
      rounded="0"
      icon
      size="small"
      style="height: auto;"
      :disabled="stored === ''"
      @click.stop="$emit('input', stored)"
    >
      <v-icon size="small">
        mdi-cog
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VLayout, VCol, VBtn, VIcon, VTextField } from 'vuetify/components'

@Component({
  components: { VLayout, VCol, VBtn, VIcon, VTextField }
})
class PushPassphraseInput extends Vue {
  @Prop({ default: '' })
  value: string

  @Prop({ default: false })
  storable: boolean

  @Prop({ default: '' })
  stored: string

  obscured = true
}

export default toNative(PushPassphraseInput)
</script>
