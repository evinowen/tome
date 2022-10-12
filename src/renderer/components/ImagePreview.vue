<template>
  <div
    ref="preview"
    :class="[ 'image-preview', zoom ? 'image-preview-zoom' : '' ]"
  >
    <file-icon
      v-if="hide"
      size="large"
      image
      alert
      disabled
    />
    <img
      v-else
      :src="src"
      :class="[ 'preview', zoom ? 'preview-zoom' : '' ]"
      @click="click"
      @error="error"
    >
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import FileIcon from '@/components/FileIcon.vue'

export default Vue.extend({
  components: { FileIcon },
  props: {
    src: { type: String, default: '' },
  },
  data: () => ({
    hide: false,
    zoom: false
  }),
  methods: {
    error: function () {
      this.hide = true
    },
    click: async function (event) {
      const scroll_x = event.offsetX / event.target.offsetWidth
      const scroll_y = event.offsetY / event.target.offsetHeight

      this.zoom = !this.zoom
      await this.$nextTick()

      const top = (scroll_y * event.target.offsetHeight) - (this.$refs.preview.offsetHeight * 0.5)
      const left = (scroll_x * event.target.offsetWidth) - (this.$refs.preview.offsetWidth * 0.5)
      const behavior = 'instant'

      this.$refs.preview.scrollTo({ top, left, behavior })
    }
  }
})
</script>

<style scoped>
.image-preview {
  overflow: overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.image-preview-zoom {
  overflow: overlay;
  display: flex;
  align-items: flex-start;
  justify-content: start;
  height: 100%;
}

.preview {
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.5);
  margin: auto;
  width: auto;
  height: auto;
  max-width: 95%;
  max-height: 95%;
  cursor: zoom-in;
}

.preview-zoom {
  width: auto;
  height: auto;
  max-width: unset;
  max-height: unset;
  cursor: zoom-out;
}

.failed {
  height: 120px;
  width: 120px;
  font-size: 90px;
}
</style>
