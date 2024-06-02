<template>
  <div
    ref="preview"
    :class="[
      'image-preview',
      { 'image-preview-zoom': zoom }
    ]"
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
      :class="[
        'preview',
        { 'preview-zoom': zoom },
        { 'preview-drag': dragging },
      ]"
      :style="zoom ? {
        width: `${zoom_width}px`,
        height: `${zoom_height}px`
      } : {}"
      @pointerup="mouseup"
      @pointermove="mousemove"
      @pointerdown="mousedown"
      @wheel="mousewheel"
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
import { ref, watch } from 'vue'
import File from '@/objects/File'

export interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const preview = ref<HTMLElement>(undefined)
const image = ref<HTMLImageElement>()

const hide = ref(false)
const zoom = ref<number>(0)

const zoom_offset_x = ref<number>(0)
const zoom_offset_y = ref<number>(0)
const zoom_width = ref<number>(0)
const zoom_height = ref<number>(0)

watch(() => properties.file, () => {
  hide.value = false
  zoom.value = 0
})

function error () {
  hide.value = true
}

const dragable = ref(false)
const dragging = ref(false)
const mouseposition_x = ref(0)
const mouseposition_y = ref(0)

async function mouseup (event: PointerEvent) {
  image.value.releasePointerCapture(event.pointerId)
  dragable.value = false

  if (dragging.value) {
    dragging.value = false
    return
  }

  zoom_offset_x.value = event.offsetX / image.value.offsetWidth
  zoom_offset_y.value = event.offsetY / image.value.offsetHeight

  if (image.value.naturalWidth > (preview.value.offsetWidth * 0.95) || image.value.naturalHeight > (preview.value.offsetHeight * 0.95)) {
    zoom.value = zoom.value > 0 ? 0 : 100
  } else {
    zoom.value = zoom.value > 0 ? 0 : 200
  }
}

function mousemove (event: PointerEvent) {
  if (dragable.value) {
    dragging.value = true
    event.preventDefault()

    preview.value.scrollTop += mouseposition_y.value - event.screenY
    preview.value.scrollLeft += mouseposition_x.value - event.screenX

    mouseposition_x.value = event.screenX
    mouseposition_y.value = event.screenY
  }
}

function mousedown (event: PointerEvent) {
  image.value.setPointerCapture(event.pointerId)
  dragable.value = true
  mouseposition_x.value = event.screenX
  mouseposition_y.value = event.screenY
}

function mousewheel (event: WheelEvent) {
  event.preventDefault()

  if (event.deltaY === 0) {
    return
  }

  const zoom_fast = event.ctrlKey

  zoom_offset_x.value = (preview.value.scrollLeft + (preview.value.offsetWidth / 2)) / preview.value.scrollWidth
  zoom_offset_y.value = (preview.value.scrollTop + (preview.value.offsetHeight / 2)) / preview.value.scrollHeight

  if (zoom.value === 0) {
    zoom.value = (image.value.offsetWidth / image.value.naturalWidth) * 100
  }

  let value = zoom.value - event.deltaY / (zoom_fast ? 10 : 50)

  if (image.value.naturalWidth > (preview.value.offsetWidth * 0.95) || image.value.naturalHeight > (preview.value.offsetHeight * 0.95)) {
    const zoom_width_percent = ((value * image.value.naturalWidth) / preview.value.offsetWidth)
    const zoom_height_percent = ((value * image.value.naturalHeight) / preview.value.offsetHeight)
    if ((zoom_width_percent <= 95) && (zoom_height_percent <= 95)) {
      value = 0
    }
  } else {
    const zoom_width_percent = ((value * image.value.naturalWidth) / image.value.naturalWidth)
    const zoom_height_percent = ((value * image.value.naturalHeight) / image.value.naturalHeight)
    if ((zoom_width_percent <= 100) && (zoom_height_percent <= 100)) {
      value = 0
    }
  }

  zoom.value = value < 0 ? 0 : value
}

watch(zoom, async (value) => {
  zoom_width.value = image.value.naturalWidth * (value / 100)
  zoom_height.value = image.value.naturalHeight * (value / 100)

  await nextTick()

  const top = (zoom_offset_y.value * zoom_height.value) - (preview.value.offsetHeight * 0.5)
  const left = (zoom_offset_x.value * zoom_width.value) - (preview.value.offsetWidth * 0.5)
  const behavior = 'auto'

  preview.value.scrollTo({ top, left, behavior })
})

defineExpose({
  error,
  hide,
  zoom,
  dragable,
  dragging,
  mouseposition_x,
  mouseposition_y,
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

.preview-drag {
  cursor: grabbing;
}

.failed {
  height: 120px;
  width: 120px;
  font-size: 90px;
}
</style>
