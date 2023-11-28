<template>
  <div
    :class="[
      'pa-2',
      'pb-0',
      'page',
      location,
      open ? 'open' : undefined
    ]"
  >
    <div :class="['mb-2', 'content', fixed ? 'fixed' : undefined ]">
      <slot />
    </div>
    <div class="pb-2 actions">
      <v-divider class="mt-0 mb-2" />
      <slot name="actions">
        <v-btn
          size="small"
          color="primary"
          @click.stop="$emit('close')"
        >
          Done
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VCard, VLayout, VRow, VBtn, VDivider, VContainer, VNavigationDrawer } from 'vuetify/components'

@Component({
  components: {
    VCard,
    VRow,
    VBtn,
    VDivider,
    VContainer,
    VNavigationDrawer,
    VLayout,
  },
  emits: [ "close" ]
})
class UtilityPage extends Vue {
  @Prop({ default: false })
  open: boolean

  @Prop({ type: Boolean, default: false })
  left: boolean

  @Prop({ type: Boolean, default: false })
  right: boolean

  @Prop({ type: Boolean, default: false })
  bottom: boolean

  @Prop({ type: Boolean, default: false })
  top: boolean

  get location () {
    if (this.left) {
      return 'left'
    }

    if (this.right) {
      return 'right'
    }

    if (this.bottom) {
      return 'bottom'
    }

    if (this.top) {
      return 'top'
    }

    return 'top'
  }
}

export default toNative(UtilityPage)
</script>

<style scoped>
.page {
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  overflow: hidden scroll;
  position: absolute;
  transition: transform 400ms ease;
  width: 100%;
  z-index: 1000;
}

.page.left {
  transform: translateX(-100%);
}

.page.right {
  transform: translateX(100%);
}

.page.bottom {
  transform: translateY(100%);
  bottom: 0;
}

.page.top {
  transform: translateY(-100%);
}

.page.open {
  transform: translateY(0%);
}

.content {
  flex-grow: 1;
}

.content.fixed {
  height: 100%;
}

.actions {
  backdrop-filter: blur(2px);
  bottom: 0;
  flex-grow: 0;
  position: sticky;
}
</style>
