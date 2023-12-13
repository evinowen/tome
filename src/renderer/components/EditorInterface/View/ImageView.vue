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
      :src="file.path"
      :class="[ 'preview', zoom ? 'preview-zoom' : '' ]"
      @click="click"
      @error="error"
    >
  </div>
</template>

<script lang="ts">
import FileIcon from '@/components/FileIcon.vue'
import { nextTick } from 'vue'

export default {
  components: {
    FileIcon,
  }
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { File } from '@/store'

export interface Props {
  file?: File,
}

const props = withDefaults(defineProps<Props>(), {
  file: undefined,
})

const preview = ref<HTMLElement>(null)

const hide = ref(false)
const zoom = ref(false)

watch(() => props.file, () => {
  hide.value = false
  zoom.value = false
})

function error () {
  hide.value = true
}

async function click (event) {
  const scroll_x = event.offsetX / event.target.offsetWidth
  const scroll_y = event.offsetY / event.target.offsetHeight

  zoom.value = !zoom.value

  await nextTick()

  const top = (scroll_y * event.target.offsetHeight) - (preview.value.offsetHeight * 0.5)
  const left = (scroll_x * event.target.offsetWidth) - (preview.value.offsetWidth * 0.5)
  const behavior = 'auto'

  preview.value.scrollTo({ top, left, behavior })
}
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
  justify-content: flex-start;
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
