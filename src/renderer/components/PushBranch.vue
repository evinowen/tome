<template>
  <v-card
    class="text-center"
    :loading="loading"
    :disabled="disabled"
  >
    <v-card-text>
      <div class="text-h6 text--primary">
        {{ url || '&mdash;' }}
      </div>
      <hr>
      <div class="text-h4 text--primary">
        {{ name || '&mdash;' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VCard, VCardText } from 'vuetify/components'

@Component({
  components: { VCard, VCardText }
})
class PushBranch extends Vue {
  @Prop({ default: undefined })
  name: string

  @Prop({ default: undefined })
  url: string

  @Prop({ default: false })
  loading: boolean

  @Prop({ default: false })
  disabled: boolean
}

export default toNative(PushBranch)
</script>
