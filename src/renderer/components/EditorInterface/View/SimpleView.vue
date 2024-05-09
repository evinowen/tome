<template>
  <div class="icon-container">
    <button-icon
      size="large"
      icon="mdi-file"
      alert
      disabled
    />
  </div>
</template>

<script lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'

export default {
  components: {
    ButtonIcon,
  },
}
</script>

<style scoped>
.icon-container {
  overflow: overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
