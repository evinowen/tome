<template>
  <v-divider
    inset
    vertical
    class="divider"
  />
</template>

<script lang="ts">
import { Component, Vue, toNative } from 'vue-facing-decorator'
import { VDivider } from 'vuetify/components'

@Component({
  components: {
    VDivider
  }
})
class Divider extends Vue {}

export default toNative(Divider)
</script>

<style scoped>
.divider {
  margin-top: 3px;
  max-height: calc(100% - 8px);
}
</style>
