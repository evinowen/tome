<template>
  <div
    :class="[
      'container',
      grow ? 'container-grow' : undefined,
    ]"
    :style="{ 'min-height': `${height}px` }"
  >
    <div class="column pr-1">
      <slot name="left" />
    </div>
    <div class="column pl-1">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'

@Component({})
class CommitListContainer extends Vue {
  @Prop({ type: Boolean, default: false })
  grow: boolean

  @Prop({ default: 0 })
  height: number
}

export default toNative(CommitListContainer)
</script>

<style>
.container {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  overflow-y: auto;
}

.container-grow {
  flex-grow: 1;
}

.column {
  display: flex;
  flex-direction: column;
  width: 50vw;
}
</style>
