<template>
  <v-container
    fluid
    class="view fill-height"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col class="text-center">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VContainer, VCol, VRow } from 'vuetify/components'

@Component({
  components: { VContainer, VCol, VRow }
})
class EmptyPane extends Vue {
  @Prop({ default: '' })
  error: string
}

export default toNative(EmptyPane)
</script>

<style scoped>
.view {
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(128,128,128,.1),
      rgba(128,128,128,.075) 3.5px,
      rgba(64,64,64,.075) 3.5px,
      rgba(64,64,64,.1) 7px
    );
}
</style>
