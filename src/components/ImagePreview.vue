<template>
  <div>
    <!-- <v-icon v-if=hide class="failed">mdi-cancel</v-icon> -->
    <file-icon v-if=hide size="large" image alert disabled />
    <img v-else :src="src" @error="error" />
  </div>
</template>

<style scoped>
.preview {
  max-width: 100%;
}

.failed {
  height: 120px;
  width: 120px;
  font-size: 90px;
}
</style>

<script>
// import { VIcon } from 'vuetify/lib'
import FileIcon from '@/components/FileIcon.vue'

export default {
  components: { FileIcon },
  props: {
    src: { type: String }
  },
  data: () => ({
    hide: false
  }),
  methods: {
    error: function () {
      this.hide = true
    }
  }
}
</script>
