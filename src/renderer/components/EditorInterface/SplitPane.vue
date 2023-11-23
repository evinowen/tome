<template>
  <div
    id="root"
    :classList="resizing ? ['resizing'] : []"
    @mousemove="resize_move"
    @mouseup="resize_end"
    @mouseleave="resize_end"
  >
    <div
      id="pane-left"
      ref="resized"
      :style="{ width: `${width}px` }"
    >
      <slot name="left" />
    </div>
    <div
      id="pane-control"
      @mousedown="resize_start"
    />
    <div id="pane-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, toNative } from 'vue-facing-decorator'

@Component({})
class SplitPane extends Vue {
  $refs: {
    resized: HTMLElement
  }

  resizing = false
  origin = 0
  width = 240

  resize_start (event) {
    this.resizing = true
    this.width = this.$refs.resized.offsetWidth
    this.origin = event.pageX
  }

  resize_move (event) {
    if (!this.resizing) {
      return
    }

    this.width += event.pageX - this.origin
    this.origin = event.pageX
  }

  resize_end () {
    this.resizing = false
  }
}

export default toNative(SplitPane)
</script>

<style scoped>
#root {
  width: 100%;
  height: 100%;
  display: flex;
}

#root.resizing {
  cursor: ew-resize;
}

#pane-left {
  height: 100%;
  position: relative;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
}

#pane-right {
  height: 100%;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
}

#pane-control {
  flex-grow: 0;
  flex-shrink: 0;
  width: 2px;
  cursor: ew-resize;
  background: rgba(var(--v-theme-on-background), 0.3);
}
</style>
