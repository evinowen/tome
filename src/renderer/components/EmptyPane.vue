<template>
  <div class="root">
    <div class="content pa-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'

@Component({})
class EmptyPane extends Vue {
  @Prop({ default: '' })
  error: string
}

export default toNative(EmptyPane)
</script>

<style scoped>
.root {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(128,128,128,.1),
      rgba(128,128,128,.075) 3.5px,
      rgba(64,64,64,.075) 3.5px,
      rgba(64,64,64,.1) 7px
    );
}

.content {
  width: 100%;
}
</style>
