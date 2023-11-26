<template>
  <div
    :class="[
      'page',
      open ? 'open' : undefined
    ]"
  >
    <v-btn
      rounded="0"
      class="pa-0"
      style="height: 16px; width: 100%"
      color="accent"
      @click.stop="$emit('close')"
    >
      <v-icon size="small">
        mdi-chevron-down
      </v-icon>
    </v-btn>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VCard, VLayout, VRow, VBtn, VIcon, VDivider, VContainer, VNavigationDrawer } from 'vuetify/components'

@Component({
  components: {
    VCard,
    VRow,
    VBtn,
    VIcon,
    VDivider,
    VContainer,
    VNavigationDrawer,
    VLayout,
  },
  emits: [ "close" ]
})
class ConsolePage extends Vue {
  @Prop({ default: false })
  open: boolean
}

export default toNative(ConsolePage)
</script>

<style scoped>
.page {
  background: rgb(var(--v-theme-surface));
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden;
  position: absolute;
  transition: transform 400ms ease;
  width: 100%;
  z-index: 1000;
  transform: translateY(100%);
}

.page.open {
  transform: translateY(0%);
}

.content {
  overflow-y: scroll;
  flex-grow: 1;
}
</style>
