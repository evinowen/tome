<template>
  <v-layout class="key-border pt-1">
    <v-col class="pa-1">
      <input
        ref="input"
        type="file"
        style="display: none"
        @change="input"
      >
      <v-text-field
        :model-value="value || ' '"
        :label="label"
        :class="[ value ? 'v-text-field-green' : 'v-text-field-red' ]"
        :color="value ? 'green' : 'red'"
        :prepend-inner-icon="value ? 'mdi-lock-open' : 'mdi-lock'"
        readonly
        variant="outlined"
        hide-details
        density="compact"
        @click.stop="$refs.input.click()"
      />
    </v-col>
    <v-btn
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon size="small">
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      v-if="forge"
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
      style="height: auto;"
      :disabled="value !== ''"
      @click.stop="$emit('forge')"
    >
      <v-icon size="small">
        mdi-anvil
      </v-icon>
    </v-btn>
    <v-btn
      v-if="storable"
      rounded="0"
      icon
      :size="small ? 'small' : undefined"
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
import { VIcon, VBtn, VTextField, VLayout, VCol } from 'vuetify/components'

@Component({
  components: { VIcon, VBtn, VTextField, VLayout, VCol }
})
class KeyfileInput extends Vue {
  @Prop({ default: '' })
  value: string

  @Prop({ default: false })
  forge: boolean

  @Prop({ default: false })
  storable: boolean

  @Prop({ default: '' })
  stored: string

  @Prop({ default: false })
  small: boolean

  @Prop({ default: '' })
  label: string

  @Prop({ default: '' })
  id: string

  $refs: {
    input: HTMLInputElement
  }

  get color () {
    return this.value ? 'green' : 'red'
  }

  async input (event) {
    const files = event.target.files || event.dataTransfer.files
    const file = files.length > 0 ? files[0] : undefined

    if (!file.path) {
      return
    }

    this.$emit('input', file.path)
    this.$refs.input.value = ''
  }
}

export default toNative(KeyfileInput)
</script>

<style scoped>
.key-label {
  font-size: 0.8em;
}

.key-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
}

.v-text-field-red :deep() fieldset {
  color: red;
  border-color: red;
}

.v-text-field-green :deep() fieldset {
  color: green;
  border-color: green;
}
</style>
