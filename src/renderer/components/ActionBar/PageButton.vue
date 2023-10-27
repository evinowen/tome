<template>
  <v-btn
    rounded="0"
    size="small"
    variant="text"
    color="primary"
    class="page-button"
  >
    <v-icon size="small">
      <slot />
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import { VBtn, VIcon } from 'vuetify/components'

@Component({
  components: {
    VBtn,
    VIcon
  }
})
class PageButton extends Vue {}

export default toNative(PageButton)
</script>

<style scoped>
.page-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 30px;
  font-size: 1.2em;
  flex-shrink: 0;
}
</style>
