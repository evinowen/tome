<template>
  <v-btn
    rounded="0"
    size="small"
    class="branch-button px-2"
    :color="branch ? 'primary' : 'error'"
    variant="flat"
  >
    <v-icon
      v-if="error"
      size="small"
      class="pr-1"
    >
      mdi-alert-box
    </v-icon>
    {{ branch || error }}
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
class BranchButton extends Vue {
  @Prop({ default: '' })
  branch: string

  @Prop({ default: '' })
  error: string
}

export default toNative(BranchButton)
</script>

<style scoped>
.branch-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 30px;
}
</style>
