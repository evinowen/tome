<template>
  <div
    ref="preview"
    :class="[ 'image-preview', zoom ? 'image-preview-zoom' : '' ]"
  >
    <button-icon
      v-if="hide"
      size="large"
      icon="mdi-image"
      alert
      disabled
    />
    <img
      v-else
      ref="image"
      :src="file.path"
      :class="[ 'preview', zoom ? 'preview-zoom' : '' ]"
      draggable
      @mouseup="mouseup"
      @mousedown="mousedown"
      @error="error"
    >
  </div>
</template>

<script lang="ts">
import ButtonIcon from '@/components/ButtonIcon.vue'
import { nextTick } from 'vue'

export default {
  components: {
    ButtonIcon,
  },
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { File } from '@/store'

export interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const preview = ref<HTMLElement>(undefined)

const hide = ref(false)
const zoom = ref(false)

watch(() => properties.file, () => {
  hide.value = false
  zoom.value = false
})

function error () {
  hide.value = true
}

let dragable = false
let dragging = false
const mouseposition = {
  x: 0,
  y: 0,
}

onMounted(() => {
  window.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', mousedragdone)
  window.addEventListener('mouseleave', mousedragdone)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', mousemove)
  window.removeEventListener('mouseup', mousedragdone)
  window.removeEventListener('mouseleave', mousedragdone)
})

async function mouseup (event) {
  dragable = false

  if (dragging) {
    mousedragdone(event)
    return
  }

  const scroll_x = event.offsetX / event.target.offsetWidth
  const scroll_y = event.offsetY / event.target.offsetHeight

  zoom.value = !zoom.value

  await nextTick()

  const top = (scroll_y * event.target.offsetHeight) - (preview.value.offsetHeight * 0.5)
  const left = (scroll_x * event.target.offsetWidth) - (preview.value.offsetWidth * 0.5)
  const behavior = 'auto'

  preview.value.scrollTo({ top, left, behavior })
}

async function mousemove (event: MouseEvent) {
  if (dragable && event.buttons == 1) {
    dragging = true
    event.preventDefault()

    preview.value.scrollTop += mouseposition.y - event.screenY
    preview.value.scrollLeft += mouseposition.x - event.screenX

    mouseposition.x = event.screenX
    mouseposition.y = event.screenY
  }
}

async function mousedown (event: MouseEvent) {
  dragable = true
  mouseposition.x = event.screenX
  mouseposition.y = event.screenY
}

async function mousedragdone (event: MouseEvent) {
  dragging = false
}

defineExpose({
  error,
  hide,
  zoom,
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
